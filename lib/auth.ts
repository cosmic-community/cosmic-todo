import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { AuthUser, AuthSession } from '@/types'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-in-production'
)

// Creates a JWT token for the user
export async function createToken(user: AuthUser): Promise<string> {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
  
  return token
}

// Sets the auth cookie with the provided token
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  })
}

// Clears the auth cookie (logout)
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}

// Creates a session by generating token and setting cookie
export async function createSession(user: AuthUser): Promise<string> {
  const token = await createToken(user)
  await setAuthCookie(token)
  return token
}

// Gets the current session from the auth cookie
export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  
  if (!token) {
    return null
  }
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      user: payload.user as AuthUser,
      token
    }
  } catch {
    return null
  }
}

// Deletes the current session
export async function deleteSession(): Promise<void> {
  await clearAuthCookie()
}

// Updates the session with new user data
export async function updateSession(user: AuthUser): Promise<string> {
  const token = await createToken(user)
  await setAuthCookie(token)
  return token
}

// Generates a 6-character alphanumeric verification code
export function generateVerificationCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return code
}

// Generates a 32-character secure password reset token
export function generatePasswordResetToken(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return token
}

// Returns ISO timestamp for password reset expiration (1 hour from now)
export function getPasswordResetExpiration(): string {
  const expirationTime = new Date()
  expirationTime.setHours(expirationTime.getHours() + 1)
  return expirationTime.toISOString()
}

// Checks if a password reset token is still valid (not expired)
export function isPasswordResetTokenValid(expirationTimestamp: string): boolean {
  const expirationDate = new Date(expirationTimestamp)
  const now = new Date()
  return expirationDate > now
}