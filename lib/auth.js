import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'bottle-refund-monitor-secret-key-change-in-production'
)

const COOKIE_NAME = 'monitor-session'

export async function createSession(username) {
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET)

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  })

  return token
}

export async function verifySession() {
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE_NAME)

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token.value, SECRET)
    return payload
  } catch {
    return null
  }
}

export function deleteSession() {
  cookies().delete(COOKIE_NAME)
}

export function validateCredentials(username, password) {
  const validUsername = process.env.AUTH_USERNAME || 'admin'
  const validPassword = process.env.AUTH_PASSWORD || 'bottle2024'

  return username === validUsername && password === validPassword
}
