import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'bottle-refund-monitor-secret-key-change-in-production'
)

// API key for kiosk devices (machine -> server communication)
const KIOSK_API_KEY = process.env.KIOSK_API_KEY || ''

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Security headers — remove info disclosure
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.delete('x-matched-path')
  response.headers.delete('x-vercel-id')
  response.headers.delete('x-vercel-cache')

  // Allow login page without auth
  if (pathname === '/login') {
    return response
  }

  // Allow static assets
  if (pathname.startsWith('/_next/') || pathname === '/favicon.ico') {
    return response
  }

  // POST /api/status — kiosk reporting (requires KIOSK_API_KEY)
  if (pathname === '/api/status' && request.method === 'POST') {
    const apiKey = request.headers.get('x-api-key')
    if (!KIOSK_API_KEY || apiKey !== KIOSK_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return response
  }

  // POST /api/auth — login endpoint (no auth needed, rate limited in handler)
  if (pathname === '/api/auth' && request.method === 'POST') {
    return response
  }

  // POST /api/logout — logout endpoint
  if (pathname === '/api/logout' && request.method === 'POST') {
    return response
  }

  // All other API routes — require JWT session
  if (pathname.startsWith('/api/')) {
    const token = request.cookies.get('monitor-session')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      await jwtVerify(token, SECRET)
      return response
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
  }

  // All page routes — require JWT session
  const token = request.cookies.get('monitor-session')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    await jwtVerify(token, SECRET)
    return response
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
