import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

// GET /api/machines - List all machines
export async function GET() {
  try {
    // Get all machine keys
    const keys = []
    let cursor = '0'
    
    do {
      const result = await kv.scan(cursor, { match: 'machine:*', count: 100 })
      cursor = result[0]
      keys.push(...result[1])
    } while (cursor !== '0')

    // Fetch all machine statuses
    const machines = []
    for (const key of keys) {
      const status = await kv.get(key)
      if (status) {
        machines.push(status)
      }
    }

    return NextResponse.json(machines)
  } catch (error) {
    console.error('Machines list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
