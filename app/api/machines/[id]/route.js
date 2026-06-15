import { NextResponse } from 'next/server'
import { getTarget } from '../../../../lib/db'
import { verifySession } from '../../../../lib/auth'

// GET /api/machines/[id] — backward compat: full agent detail
export async function GET(request, { params }) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const target = await getTarget(id)
    if (!target || target.type !== 'agent') {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 })
    }

    return NextResponse.json(target)
  } catch (error) {
    console.error('Machine detail error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
