import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'
import { verifySession } from '../../../../lib/auth'

const kv = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

// DELETE /api/admin/machines?id=xxx — Delete machine + history
export async function DELETE(request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id || typeof id !== 'string' || id.length > 50) {
      return NextResponse.json({ error: 'Invalid machine id' }, { status: 400 })
    }

    const machineId = id.replace(/[^a-zA-Z0-9_-]/g, '')
    const machineKey = `machine:${machineId}`
    const historyKey = `history:${machineId}`

    // Check if exists
    const exists = await kv.exists(machineKey)
    if (!exists) {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 })
    }

    // Delete machine + history
    await kv.del(machineKey, historyKey)

    return NextResponse.json({ success: true, deleted: machineId })
  } catch (error) {
    console.error('Machine delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/machines — Update machine name/alias
export async function PUT(request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, location } = body

    if (!id || typeof id !== 'string' || id.length > 50) {
      return NextResponse.json({ error: 'Invalid machine id' }, { status: 400 })
    }

    const machineId = id.replace(/[^a-zA-Z0-9_-]/g, '')
    const machineKey = `machine:${machineId}`

    const existing = await kv.get(machineKey)
    if (!existing) {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 })
    }

    // Update fields
    const updated = { ...existing }
    if (name !== undefined) updated.name = name
    if (location !== undefined) updated.location = location
    updated.last_modified = new Date().toISOString()

    await kv.set(machineKey, updated)

    return NextResponse.json({ success: true, machine: updated })
  } catch (error) {
    console.error('Machine update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
