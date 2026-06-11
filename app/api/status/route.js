import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const kv = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

// Whitelist of allowed fields from kiosk
const ALLOWED_FIELDS = [
  'status_machine', 'status_tank', 'cpu_percent', 'ram_percent',
  'ram_used_mb', 'ram_total_mb', 'state', 'processes',
  'hardware', 'network',
]

// POST /api/status - Receive machine status from kiosk (requires KIOSK_API_KEY via middleware)
export async function POST(request) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id || typeof id !== 'string' || id.length > 50) {
      return NextResponse.json({ error: 'Invalid or missing machine id' }, { status: 400 })
    }

    // Sanitize machine ID — only allow alphanumeric, dash, underscore
    const machineId = id.replace(/[^a-zA-Z0-9_-]/g, '')
    if (!machineId) {
      return NextResponse.json({ error: 'Invalid machine id format' }, { status: 400 })
    }

    const timestamp = new Date().toISOString()
    const machineKey = `machine:${machineId}`
    const historyKey = `history:${machineId}`

    // Build status object with only allowed fields
    const currentStatus = { id: machineId }
    for (const field of ALLOWED_FIELDS) {
      if (body[field] !== undefined) {
        currentStatus[field] = body[field]
      }
    }
    currentStatus.last_update = timestamp

    await kv.set(machineKey, currentStatus)

    // Append to history (keep last 500 entries — reduced from 1000)
    const historyEntry = { ...currentStatus, timestamp }
    const history = (await kv.get(historyKey)) || []
    history.unshift(historyEntry)
    if (history.length > 500) {
      history.length = 500
    }
    await kv.set(historyKey, history)

    return NextResponse.json({ success: true, timestamp })
  } catch (error) {
    console.error('Status update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/status?id=2 - Get current machine status (requires auth via middleware)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id || typeof id !== 'string' || id.length > 50) {
      return NextResponse.json({ error: 'Invalid or missing machine id' }, { status: 400 })
    }

    const machineId = id.replace(/[^a-zA-Z0-9_-]/g, '')
    const machineKey = `machine:${machineId}`
    const status = await kv.get(machineKey)

    if (!status) {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 })
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error('Status fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
