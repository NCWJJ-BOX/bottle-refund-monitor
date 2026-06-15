#!/usr/bin/env python3
"""Agent status reporter — collects system data and POSTs to server."""

import json
import os
import platform
import subprocess
import sys
import time
import urllib.request
import urllib.error

# ── Config ──────────────────────────────────────────────────────────
SERVER_URL = os.getenv('SERVER_URL', 'http://localhost:3000')
AGENT_ID = os.getenv('AGENT_ID', 'agent-1')
INTERVAL = int(os.getenv('REPORT_INTERVAL', '30'))
API_KEY = os.getenv('KIOSK_API_KEY', '')


def cpu_percent():
    """CPU load as percentage."""
    try:
        with open('/proc/stat') as f:
            line = f.readline()
        fields = [int(x) for x in line.strip().split()[1:]]
        total = sum(fields)
        idle = fields[3]
        return round((1 - idle / total) * 100, 1)
    except Exception:
        return 0.0


def ram_info():
    """Return (percent, used_mb, total_mb)."""
    try:
        with open('/proc/meminfo') as f:
            lines = f.readlines()
        total = int([l for l in lines if l.startswith('MemTotal:')][0].split()[1])
        avail = int([l for l in lines if l.startswith('MemAvailable:')][0].split()[1])
        total_mb = round(total / 1024, 1)
        used_mb = round((total - avail) / 1024, 1)
        percent = round((1 - avail / total) * 100, 1)
        return percent, used_mb, total_mb
    except Exception:
        return 0.0, 0.0, 0.0


def processes():
    """Top 10 CPU-consuming process names."""
    try:
        out = subprocess.check_output(
            ['ps', '--no-headers', '-eo', 'comm', '--sort=-%cpu'],
            timeout=5, text=True
        )
        return [p.strip() for p in out.strip().split('\n')[:10] if p.strip()]
    except Exception:
        return []


def hardware():
    """Detect serial, camera, sensor."""
    hw = {'serial': platform.platform()}
    try:
        with open('/proc/cpuinfo') as f:
            for line in f:
                if line.startswith('Serial'):
                    hw['serial'] = line.strip().split(':')[-1].strip()
                    break
    except Exception:
        pass

    try:
        r = subprocess.run(['vcgencmd', 'get_camera'], capture_output=True, text=True, timeout=3)
        hw['camera'] = r.stdout.strip() if r.returncode == 0 else 'unknown'
    except Exception:
        hw['camera'] = 'unavailable'

    for path in ['/dev/ttyACM0', '/dev/ttyUSB0']:
        hw[path.replace('/', '_')] = 'present' if os.path.exists(path) else 'absent'

    return hw


def network():
    """WiFi SSID + interface throughput."""
    net = {}
    try:
        r = subprocess.run(['iwgetid', '-r'], capture_output=True, text=True, timeout=3)
        net['ssid'] = r.stdout.strip() if r.returncode == 0 else None
    except Exception:
        net['ssid'] = None

    try:
        with open('/proc/net/dev') as f:
            for line in f.readlines()[2:]:
                iface = line.split(':')[0].strip()
                if iface == 'lo':
                    continue
                stats = line.split()[1:]
                net[f'{iface}_rx_kb'] = round(int(stats[0]) / 1024, 1)
                net[f'{iface}_tx_kb'] = round(int(stats[8]) / 1024, 1)
    except Exception:
        pass

    return net


def collect():
    """Collect all system data."""
    pct, used, total = ram_info()
    return {
        'id': AGENT_ID,
        'type': 'agent',
        'name': f'Agent {AGENT_ID}',
        'status_machine': 'running',
        'status_tank': None,
        'cpu_percent': cpu_percent(),
        'ram_percent': pct,
        'ram_used_mb': used,
        'ram_total_mb': total,
        'state': 'active',
        'processes': processes(),
        'hardware': hardware(),
        'network': network(),
    }


def send(payload):
    """POST JSON payload to server."""
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        f'{SERVER_URL.rstrip("/")}/api/status',
        data=data,
        headers={'Content-Type': 'application/json'},
        method='POST',
    )
    if API_KEY:
        req.add_header('x-api-key', API_KEY)

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status == 200
    except urllib.error.HTTPError as e:
        print(f'HTTP {e.code}: {e.read().decode()}', file=sys.stderr)
        return False
    except urllib.error.URLError as e:
        print(f'Network error: {e.reason}', file=sys.stderr)
        return False


def main():
    print(f'Agent started — id={AGENT_ID} server={SERVER_URL} interval={INTERVAL}s')
    while True:
        payload = collect()
        ok = send(payload)
        ts = time.strftime('%Y-%m-%d %H:%M:%S')
        status = 'OK' if ok else 'FAIL'
        print(f'[{ts}] {status} | CPU={payload["cpu_percent"]}% RAM={payload["ram_percent"]}%')
        time.sleep(INTERVAL)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('\nStopped.')
