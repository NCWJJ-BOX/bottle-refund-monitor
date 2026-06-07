import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'
import { verifySession } from '../../../lib/auth'

const kv = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

// GET /api/history?id=2&limit=50 - Get machine status history (requires auth)
export async function GET(request) {
  try {
    // Verify session
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)

    if (!id || typeof id !== 'string' || id.length > 50) {
      return NextResponse.json({ error: 'Invalid or missing machine id' }, { status: 400 })
    }

    const machineId = id.replace(/[^a-zA-Z0-9_-]/g, '')
    const historyKey = `history:${machineId}`
    const history = (await kv.get(historyKey)) || []

    return NextResponse.json(history.slice(0, limit))
  } catch (error) {
    console.error('History fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
