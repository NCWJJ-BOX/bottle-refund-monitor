import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

// POST /api/status - Receive machine status from kiosk
export async function POST(request) {
  try {
    const body = await request.json()
    const { id, status_machine, status_tank } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing machine id' }, { status: 400 })
    }

    const timestamp = new Date().toISOString()
    const machineKey = `machine:${id}`
    const historyKey = `history:${id}`

    // Store current status
    const currentStatus = {
      id,
      status_machine: status_machine || 'UNKNOWN',
      status_tank: status_tank || null,
      last_update: timestamp,
    }

    await kv.set(machineKey, currentStatus)

    // Append to history (keep last 1000 entries)
    const historyEntry = {
      ...currentStatus,
      timestamp,
    }

    const history = (await kv.get(historyKey)) || []
    history.unshift(historyEntry)
    if (history.length > 1000) {
      history.length = 1000
    }
    await kv.set(historyKey, history)

    return NextResponse.json({ success: true, timestamp })
  } catch (error) {
    console.error('Status update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/status?id=2 - Get current machine status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing machine id' }, { status: 400 })
    }

    const machineKey = `machine:${id}`
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
