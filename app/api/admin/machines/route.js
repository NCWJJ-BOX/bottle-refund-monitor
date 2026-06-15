import { NextResponse } from 'next/server'
import { getTarget, setTarget, deleteTarget, sanitizeId } from '../../../../lib/db'
import { verifySession } from '../../../../lib/auth'

// DELETE /api/admin/machines?id=xxx — backward compat
export async function DELETE(request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const cleanId = sanitizeId(id)
    const existing = await getTarget(cleanId)
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await deleteTarget(cleanId)
    return NextResponse.json({ success: true, deleted: cleanId })
  } catch (error) {
    console.error('Admin delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/machines — backward compat
export async function PUT(request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, location } = body
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const cleanId = sanitizeId(id)
    const existing = await getTarget(cleanId)
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updated = { ...existing }
    if (name !== undefined) updated.name = name
    if (location !== undefined) updated.location = location
    updated.last_modified = new Date().toISOString()

    await setTarget(cleanId, updated)
    return NextResponse.json({ success: true, target: updated })
  } catch (error) {
    console.error('Admin update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
