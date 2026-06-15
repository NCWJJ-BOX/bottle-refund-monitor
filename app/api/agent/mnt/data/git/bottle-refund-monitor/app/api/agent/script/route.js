import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

// GET /api/agent/script — returns kiosk-agent.py for piping
export async function GET() {
  try {
    const scriptPath = join(process.cwd(), 'kiosk-agent.py')
    const script = readFileSync(scriptPath, 'utf-8')

    return new NextResponse(script, {
      status: 200,
      headers: {
        'Content-Type': 'text/x-python; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Script not found' }, { status: 500 })
  }
}
