#!/usr/bin/env python3
"""
Agent status reporter — collects system data and POSTs to server.

Usage:
  python3 kiosk-agent.py --id=my-box --server=https://monitor.box-dex.win
  python3 kiosk-agent.py --id=my-box --server=https://monitor.box-dex.win --mode=cpu,ram,network
  python3 kiosk-agent.py --id=my-box --server=https://monitor.box-dex.win --interval=60 --api-key=xxx

Pipe mode:
  curl -sL https://monitor.box-dex.win/api/agent/script | python3 - --id=my-box --server=https://monitor.box-dex.win
"""

import json
import os
import platform
import subprocess
import sys
import time
import urllib.request
import urllib.error

# ── Argument parsing ────────────────────────────────────────────────
def parse_args():
    args = {}
    for a in sys.argv[1:]:
        if a.startswith('--'):
            if '=' in a:
                k, v = a[2:].split('=', 1)
                args[k.replace('-', '_')] = v
    return args

ARGS = parse_args()

SERVER_URL = ARGS.get('server', os.getenv('SERVER_URL', 'http://localhost:3000'))
AGENT_ID = ARGS.get('id', os.getenv('AGENT_ID', 'agent-1'))
INTERVAL = int(ARGS.get('interval', os.getenv('REPORT_INTERVAL', '30')))
API_KEY = ARGS.get('api_key', os.getenv('KIOSK_API_KEY', ''))
AGENT_NAME = ARGS.get('name', os.getenv('AGENT_NAME', f'Agent {AGENT_ID}'))
LOCATION = ARGS.get('location', os.getenv('LOCATION', ''))
MODE = ARGS.get('mode', os.getenv('MODE', 'cpu,ram,system,network')).split(',')

def enabled(m):
    return m in MODE or 'all' in MODE

# ── Collectors ───────────────────────────────────────────────────────

def cpu_percent():
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
    try:
        out = subprocess.check_output(
            ['ps', '--no-headers', '-eo', 'comm', '--sort=-%cpu'],
            timeout=5, text=True
        )
        return [p.strip() for p in out.strip().split('\n')[:10] if p.strip()]
    except Exception:
        return []


def hardware():
    hw = {'serial': platform.platform()}
    try:
        with open('/proc/cpuinfo') as f:
            for line in f:
                if line.startswith('Serial'):
                    hw['serial'] = line.strip().split(':')[-1].strip()
                    break
    except Exception:
        pass

    for dev in ['/dev/ttyACM0', '/dev/ttyUSB0', '/dev/ttyAMA0']:
        hw[dev.replace('/', '_')] = 'present' if os.path.exists(dev) else 'absent'

    return hw


def network_info():
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

    # Internet check
    try:
        r = subprocess.run(['ping', '-c', '1', '-W', '2', '8.8.8.8'],
                           capture_output=True, timeout=5)
        net['internet_ok'] = r.returncode == 0
        if net['internet_ok'] and r.stdout:
            import re
            m = re.search(r'time=([\d.]+)', r.stdout.decode())
            if m:
                net['latency_ms'] = float(m.group(1))
    except Exception:
        net['internet_ok'] = False

    return net


def disk_info():
    try:
        r = subprocess.run(['df', '-h', '--output=size,used,avail,pcent', '/'],
                           capture_output=True, text=True, timeout=5)
        lines = r.stdout.strip().split('\n')
        if len(lines) >= 2:
            parts = lines[1].split()
            return {
                'total': parts[0],
                'used': parts[1],
                'avail': parts[2],
                'percent': parts[3],
            }
    except Exception:
        pass
    return {}


def uptime():
    try:
        with open('/proc/uptime') as f:
            secs = float(f.readline().split()[0])
            days = int(secs // 86400)
            hours = int((secs % 86400) // 3600)
            mins = int((secs % 3600) // 60)
            return f'{days}d {hours}h {mins}m'
    except Exception:
        return ''


# ── Collect ──────────────────────────────────────────────────────────

def collect():
    payload = {
        'id': AGENT_ID,
        'type': 'agent',
        'name': AGENT_NAME,
    }
    if LOCATION:
        payload['location'] = LOCATION

    if enabled('cpu'):
        payload['cpu_percent'] = cpu_percent()

    if enabled('ram'):
        pct, used, total = ram_info()
        payload['ram_percent'] = pct
        payload['ram_used_mb'] = used
        payload['ram_total_mb'] = total

    if enabled('system'):
        payload['processes'] = processes()
        payload['disk'] = disk_info()
        payload['uptime'] = uptime()
        payload['state'] = 'active'

    if enabled('network'):
        payload['network'] = network_info()

    return payload


# ── Send ─────────────────────────────────────────────────────────────

def send(payload):
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


# ── Main ─────────────────────────────────────────────────────────────

def main():
    print(f'[monitor] started — id={AGENT_ID} server={SERVER_URL} interval={INTERVAL}s mode={",".join(MODE)}')
    while True:
        payload = collect()
        ok = send(payload)
        ts = time.strftime('%Y-%m-%d %H:%M:%S')
        status = 'OK' if ok else 'FAIL'
        cpu = payload.get('cpu_percent', '-')
        ram = payload.get('ram_percent', '-')
        print(f'[{ts}] {status} | CPU={cpu}% RAM={ram}%')
        time.sleep(INTERVAL)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('\n[monitor] stopped.')
    except Exception as e:
        print(f'[monitor] error: {e}', file=sys.stderr)
        sys.exit(1)
