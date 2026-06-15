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
  let response

  // Public paths — no auth required
  if (pathname === '/login') {
    response = NextResponse.next()
  }
  else if (pathname.startsWith('/_next/') || pathname === '/favicon.ico') {
    response = NextResponse.next()
  }
  // POST /api/status — kiosk agent push (optional KIOSK_API_KEY)
  else if (pathname === '/api/status' && request.method === 'POST') {
    if (KIOSK_API_KEY) {
      const apiKey = request.headers.get('x-api-key')
      response = apiKey === KIOSK_API_KEY
        ? NextResponse.next()
        : NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    } else {
      response = NextResponse.next()
    }
  }
  // POST /api/check/run — cron trigger (optional CHECK_API_KEY)
  else if (pathname === '/api/check/run') {
    const checkKey = process.env.CHECK_API_KEY
    if (checkKey) {
      const apiKey = request.headers.get('x-check-key')
      response = apiKey === checkKey
        ? NextResponse.next()
        : NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    } else {
      response = NextResponse.next()
    }
  }
  // POST /api/auth — login
  else if (pathname === '/api/auth' && request.method === 'POST') {
    response = NextResponse.next()
  }
  // POST /api/logout
  else if (pathname === '/api/logout') {
    response = NextResponse.next()
  }
  // GET /api/agent/script — public, served for piping into python
  else if (pathname === '/api/agent/script' && request.method === 'GET') {
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
  // Page routes — require JWT
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
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://monitor.box-dex.win; form-action 'self'; frame-ancestors 'none'; base-uri 'self'"
  )
  response.headers.set('Access-Control-Allow-Origin', 'https://monitor.box-dex.win')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  // Remove info-leaking + hop-by-hop headers
  response.headers.delete('x-matched-path')
  response.headers.delete('x-vercel-id')
  response.headers.delete('x-vercel-cache')
  response.headers.delete('x-vercel-challenge-token')
  response.headers.delete('x-vercel-mitigated')
  response.headers.delete('server')
  response.headers.delete('Connection')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')

  return response
}
