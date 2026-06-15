import { NextResponse } from 'next/server'
import { listTargets, getTarget } from '../../../lib/db'
import { verifySession } from '../../../lib/auth'

// GET /api/machines — backward compat: list agent-type targets
export async function GET() {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const targets = await listTargets('agent')
    // Map to old format for backward compat
    const machines = targets.map(t => ({
      id: t.id,
      name: t.name,
      status_machine: t.status === 'online' ? 'ON' : 'OFF',
      status_tank: t.status_tank,
      cpu_percent: t.cpu_percent,
      ram_percent: t.ram_percent,
      state: t.state,
      last_update: t.last_update,
      location: t.location,
    }))

    return NextResponse.json(machines)
  } catch (error) {
    console.error('Machines list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
