import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

if (!SECRET || SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET must be set and at least 32 characters')
}

const COOKIE_NAME = 'monitor-session'

export async function createSession(username) {
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h') // Reduced from 7d to 8h
    .sign(SECRET)

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', // Changed from 'lax' to 'strict'
    maxAge: 8 * 60 * 60, // 8 hours
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
  const validUsername = process.env.AUTH_USERNAME
  const validPassword = process.env.AUTH_PASSWORD

  // Reject if env vars not set
  if (!validUsername || !validPassword) {
    console.error('AUTH_USERNAME or AUTH_PASSWORD not set in environment')
    return false
  }

  return username === validUsername && password === validPassword
}
