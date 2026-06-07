import { NextResponse } from 'next/server'
import { createSession, validateCredentials } from '../../../lib/auth'
import { rateLimit, getClientIp } from '../../../lib/rate-limit'

export async function POST(request) {
  try {
    const ip = getClientIp(request)

    // Rate limit: 5 attempts per 60 seconds per IP
    const { allowed, remaining } = await rateLimit(`auth:${ip}`, 5, 60)

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
          },
        }
      )
    }

    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      )
    }

    if (!validateCredentials(username, password)) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        {
          status: 401,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': String(remaining),
          },
        }
      )
    }

    const token = await createSession(username)

    return NextResponse.json(
      { success: true },
      {
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': String(remaining),
        },
      }
    )
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
