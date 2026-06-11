import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'bottle-refund-monitor-secret-key-change-in-production'
)

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Login page — always public
  if (pathname === '/login') {
    return NextResponse.next()
  }

  // Auth endpoint — public (for logging in)
  if (pathname === '/api/auth') {
    return NextResponse.next()
  }

  // Kiosk POST status — public (machines pushing data)
  if (pathname === '/api/status' && request.method === 'POST') {
    return NextResponse.next()
  }

  // API routes — require auth (JSON response)
  if (pathname.startsWith('/api/')) {
    const token = request.cookies.get('monitor-session')?.value
    if (!token) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      })
    }
    try {
      await jwtVerify(token, SECRET)
      return NextResponse.next()
    } catch {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      })
    }
  }

  // Dashboard page — redirect to login if not authenticated
  const token = request.cookies.get('monitor-session')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  try {
    await jwtVerify(token, SECRET)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
