import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const kv = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

// GET /api/history?id=2&limit=50 - Get machine status history
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    if (!id) {
      return NextResponse.json({ error: 'Missing machine id' }, { status: 400 })
    }

    const historyKey = `history:${id}`
    const history = (await kv.get(historyKey)) || []

    return NextResponse.json(history.slice(0, limit))
  } catch (error) {
    console.error('History fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
