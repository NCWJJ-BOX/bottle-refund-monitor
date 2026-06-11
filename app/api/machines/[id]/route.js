import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'
import { verifySession } from '../../../../lib/auth'

const kv = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

// GET /api/machines/[id] — Full machine detail (auth required)
export async function GET(request, { params }) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    if (!id || id.length > 50) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    const machineId = id.replace(/[^a-zA-Z0-9_-]/g, '')
    const machineKey = `machine:${machineId}`

    const data = await kv.get(machineKey)
    if (!data) {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Machine detail error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
