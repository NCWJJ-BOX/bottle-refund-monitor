import { NextResponse } from 'next/server'
import { deleteSession } from '../../../lib/auth'

export async function POST() {
  deleteSession()
  return NextResponse.json({ success: true })
}

export async function GET(request) {
  deleteSession()
  return NextResponse.redirect(new URL('/login', request.url))
}
