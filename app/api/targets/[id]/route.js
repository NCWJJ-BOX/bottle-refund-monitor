import { NextResponse } from 'next/server'
import { getTarget, setTarget, deleteTarget } from '../../../../lib/db'
import { verifySession } from '../../../../lib/auth'

// GET /api/targets/[id] — full target detail
export async function GET(request, { params }) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const target = await getTarget(id)
    if (!target) {
      return NextResponse.json({ error: 'Target not found' }, { status: 404 })
    }
    return NextResponse.json(target)
  } catch (error) {
    console.error('Target detail error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/targets/[id] — update name, url, etc.
export async function PUT(request, { params }) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await getTarget(id)
    if (!existing) {
      return NextResponse.json({ error: 'Target not found' }, { status: 404 })
    }

    const body = await request.json()
    const updated = { ...existing }

    if (body.name !== undefined) updated.name = body.name
    if (body.url !== undefined) updated.url = body.url
    if (body.method !== undefined) updated.method = body.method
    if (body.expected_status !== undefined) updated.expected_status = body.expected_status
    if (body.location !== undefined) updated.location = body.location
    updated.last_modified = new Date().toISOString()

    await setTarget(id, updated)
    return NextResponse.json({ success: true, target: updated })
  } catch (error) {
    console.error('Target update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/targets/[id]
export async function DELETE(request, { params }) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await getTarget(id)
    if (!existing) {
      return NextResponse.json({ error: 'Target not found' }, { status: 404 })
    }

    await deleteTarget(id)
    return NextResponse.json({ success: true, deleted: id })
  } catch (error) {
    console.error('Target delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
