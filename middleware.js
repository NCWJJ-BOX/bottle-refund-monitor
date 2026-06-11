import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET
)

const KIOSK_API_KEY = process.env.KIOSK_API_KEY || ''

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Create response first — we'll modify headers on it
  let response

  // Allow login page without auth
  if (pathname === '/login') {
    response = NextResponse.next()
  }
  // Static assets
  else if (pathname.startsWith('/_next/') || pathname === '/favicon.ico') {
    response = NextResponse.next()
  }
  // POST /api/status — kiosk reporting (optional KIOSK_API_KEY)
  else if (pathname === '/api/status' && request.method === 'POST') {
    if (KIOSK_API_KEY) {
      const apiKey = request.headers.get('x-api-key')
      if (apiKey !== KIOSK_API_KEY) {
        response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      } else {
        response = NextResponse.next()
      }
    } else {
      response = NextResponse.next()
    }
  }
  // POST /api/auth — login endpoint
  else if (pathname === '/api/auth' && request.method === 'POST') {
    response = NextResponse.next()
  }
  // POST /api/logout
  else if (pathname === '/api/logout' && request.method === 'POST') {
    response = NextResponse.next()
  }
  // All other API routes — require JWT
  else if (pathname.startsWith('/api/')) {
    const token = request.cookies.get('monitor-session')?.value
    if (!token) {
      response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    } else {
      try {
        await jwtVerify(token, SECRET)
        response = NextResponse.next()
      } catch {
        response = NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
    }
  }
  // All page routes — require JWT
  else {
    const token = request.cookies.get('monitor-session')?.value
    if (!token) {
      response = NextResponse.redirect(new URL('/login', request.url))
    } else {
      try {
        await jwtVerify(token, SECRET)
        response = NextResponse.next()
      } catch {
        response = NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Attempt to remove Vercel debug headers
  // These are injected at edge level — may not be removable from middleware
  response.headers.delete('x-matched-path')
  response.headers.delete('x-vercel-id')
  response.headers.delete('x-vercel-cache')

  return response
}
