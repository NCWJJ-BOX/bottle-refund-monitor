import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'
import { verifySession } from '../../../lib/auth'

const kv = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

// GET /api/machines - List all machines (requires auth)
export async function GET() {
  try {
    // Verify session
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all machine keys
    const keys = []
    let cursor = '0'

    do {
      const result = await kv.scan(cursor, { match: 'machine:*', count: 100 })
      cursor = result[0]
      keys.push(...result[1])
    } while (cursor !== '0')

    // Fetch all machine statuses — sanitize sensitive data
    const machines = []
    for (const key of keys) {
      const status = await kv.get(key)
      if (status) {
        machines.push({
          id: status.id,
          status_machine: status.status_machine,
          status_tank: status.status_tank,
          cpu_percent: status.cpu_percent,
          ram_percent: status.ram_percent,
          state: status.state,
          last_update: status.last_update,
          // Excluded: processes, hardware, network (internal details)
        })
      }
    }

    return NextResponse.json(machines)
  } catch (error) {
    console.error('Machines list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
