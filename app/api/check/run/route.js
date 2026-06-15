import { NextResponse } from 'next/server'
import { runHttpChecks } from '../../../../lib/db'

const CHECK_API_KEY = process.env.CHECK_API_KEY || ''

// POST /api/check/run — trigger HTTP checks on all http targets
// Protected by CHECK_API_KEY header
export async function POST(request) {
  try {
    if (CHECK_API_KEY) {
      const apiKey = request.headers.get('x-check-key')
      if (apiKey !== CHECK_API_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const results = await runHttpChecks()
    return NextResponse.json({
      success: true,
      checked: results.length,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Check run error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/check/run — same via GET for cron-job.org compat (no POST body needed)
export async function GET(request) {
  return POST(request)
}
