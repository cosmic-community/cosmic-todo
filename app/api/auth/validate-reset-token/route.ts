import { NextRequest, NextResponse } from 'next/server'
import { getUserByResetToken } from '@/lib/cosmic'
import { isPasswordResetTokenValid } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    
    // Validate input
    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token is required' },
        { status: 400 }
      )
    }
    
    // Find user by reset token
    const user = await getUserByResetToken(token)
    
    if (!user) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid reset link'
      })
    }
    
    // Check if token is expired
    if (!user.metadata.password_reset_expires || 
        !isPasswordResetTokenValid(user.metadata.password_reset_expires)) {
      return NextResponse.json({
        valid: false,
        error: 'This reset link has expired'
      })
    }
    
    return NextResponse.json({
      valid: true,
      email: user.metadata.email
    })
    
  } catch (error) {
    console.error('Validate reset token error:', error)
    return NextResponse.json(
      { valid: false, error: 'Failed to validate token' },
      { status: 500 }
    )
  }
}