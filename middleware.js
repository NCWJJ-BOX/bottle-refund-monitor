import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'bottle-refund-monitor-secret-key-change-in-production'
)

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Allow all API routes (no auth for kiosk + dashboard data)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Allow login page
  if (pathname === '/login') {
    return NextResponse.next()
  }

  // Protect dashboard page
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
