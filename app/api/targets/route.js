import { NextResponse } from 'next/server'
import { listTargets, getTarget, setTarget, deleteTarget, sanitizeId } from '../../../lib/db'
import { verifySession } from '../../../lib/auth'

// GET /api/targets — list all targets (with optional ?type= filter)
export async function GET(request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'agent' | 'http' | null (all)

    const targets = await listTargets(type)
    return NextResponse.json(targets)
  } catch (error) {
    console.error('Targets list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/targets — create a new target (http type)
export async function POST(request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, name, url, method, expected_status } = body

    if (!type || !['http', 'agent'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type (must be http or agent)' }, { status: 400 })
    }
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (type === 'http' && !url) {
      return NextResponse.json({ error: 'URL is required for http targets' }, { status: 400 })
    }

    const id = sanitizeId(name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36))
    const now = new Date().toISOString()

    const target = {
      id,
      type,
      name,
      url: type === 'http' ? url : undefined,
      method: method || 'GET',
      expected_status: expected_status || 200,
      status: 'unknown',
      response_time_ms: 0,
      last_check: null,
      error: null,
      location: body.location || null,
      created_at: now,
      last_modified: now,
    }

    await setTarget(id, target)
    return NextResponse.json({ success: true, target }, { status: 201 })
  } catch (error) {
    console.error('Target create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
