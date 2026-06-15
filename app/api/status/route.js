import { NextResponse } from 'next/server'
import { setTarget, getTarget, appendHistory, sanitizeId } from '../../../lib/db'

// Whitelist of allowed fields from agent
const ALLOWED_FIELDS = [
  'status_machine', 'status_tank', 'cpu_percent', 'ram_percent',
  'ram_used_mb', 'ram_total_mb', 'state', 'processes',
  'hardware', 'network',
]

// POST /api/status — Receive status from agents (Pi kiosk, etc.)
export async function POST(request) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id || typeof id !== 'string' || id.length > 50) {
      return NextResponse.json({ error: 'Invalid or missing target id' }, { status: 400 })
    }

    const targetId = sanitizeId(id)
    if (!targetId) {
      return NextResponse.json({ error: 'Invalid id format' }, { status: 400 })
    }

    const timestamp = new Date().toISOString()

    // Get existing target or create new
    let target = await getTarget(targetId)
    if (!target) {
      target = {
        id: targetId,
        type: 'agent',
        name: body.name || `Agent #${targetId}`,
        location: body.location || null,
        status: 'online',
        last_update: timestamp,
        created_at: timestamp,
      }
    }

    // Update fields from agent payload
    target.status = 'online'
    target.last_update = timestamp
    for (const field of ALLOWED_FIELDS) {
      if (body[field] !== undefined) {
        target[field] = body[field]
      }
    }
    if (body.name) target.name = body.name
    if (body.location) target.location = body.location

    await setTarget(targetId, target)

    // Append to history
    const historyEntry = { ...target, timestamp }
    // Redact verbose fields from history
    const slimEntry = {
      status: target.status,
      cpu_percent: target.cpu_percent,
      ram_percent: target.ram_percent,
      ram_used_mb: target.ram_used_mb,
      ram_total_mb: target.ram_total_mb,
      status_tank: target.status_tank,
      timestamp,
    }
    await appendHistory(targetId, slimEntry)

    return NextResponse.json({ success: true, timestamp })
  } catch (error) {
    console.error('Status update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/status?id=X — Get current status (backward compat)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id || typeof id !== 'string' || id.length > 50) {
      return NextResponse.json({ error: 'Invalid or missing target id' }, { status: 400 })
    }

    const targetId = sanitizeId(id)
    const target = await getTarget(targetId)

    if (!target) {
      return NextResponse.json({ error: 'Target not found' }, { status: 404 })
    }

    return NextResponse.json(target)
  } catch (error) {
    console.error('Status fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
