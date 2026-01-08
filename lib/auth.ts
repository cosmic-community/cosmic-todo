import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { AuthUser, AuthSession } from '@/types'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-in-production'
)

// Changed: Added createToken function (alias for JWT token creation without setting cookie)
export async function createToken(user: AuthUser): Promise<string> {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
  
  return token
}

// Changed: Added setAuthCookie function to set the auth cookie separately
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

// Changed: Added clearAuthCookie function (alias for deleteSession)
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}

export async function createSession(user: AuthUser): Promise<string> {
  const token = await createToken(user)
  await setAuthCookie(token)
  return token
}

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

export async function deleteSession(): Promise<void> {
  await clearAuthCookie()
}

// Changed: Added updateSession function to update session with new user data including checkbox_position
export async function updateSession(user: AuthUser): Promise<string> {
  const token = await createToken(user)
  await setAuthCookie(token)
  return token
}

// Changed: Added generateVerificationCode function for email verification
export function generateVerificationCode(): string {
  // Generate a 6-character alphanumeric code
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return code
}

// Changed: Added generatePasswordResetToken function for password reset
export function generatePasswordResetToken(): string {
  // Generate a secure random token for password reset
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return token
}

// Changed: Added getPasswordResetExpiration function to get expiration timestamp (1 hour from now)
export function getPasswordResetExpiration(): string {
  const expirationTime = new Date()
  expirationTime.setHours(expirationTime.getHours() + 1)
  return expirationTime.toISOString()
}

// Changed: Added isPasswordResetTokenValid function to check if reset token is still valid
export function isPasswordResetTokenValid(expirationTimestamp: string): boolean {
  const expirationDate = new Date(expirationTimestamp)
  const now = new Date()
  return expirationDate > now
}