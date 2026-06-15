import { NextResponse } from 'next/server'
import { getTarget, getHistory } from '../../../../lib/db'
import { verifySession } from '../../../../lib/auth'

// GET /api/check/history?id=X&limit=N — get check/target history
export async function GET(request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)

    if (!id || typeof id !== 'string' || id.length > 50) {
      return NextResponse.json({ error: 'Invalid or missing id' }, { status: 400 })
    }

    const history = await getHistory(id, limit)
    return NextResponse.json(history)
  } catch (error) {
    console.error('History fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
