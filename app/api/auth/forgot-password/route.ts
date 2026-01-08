import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, updateUser } from '@/lib/cosmic'
import { generatePasswordResetToken, getPasswordResetExpiration } from '@/lib/auth'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }
    
    // Find user by email
    const user = await getUserByEmail(email.toLowerCase())
    
    // Always return success even if user not found (security best practice)
    // This prevents email enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, we sent a password reset link.'
      })
    }
    
    // Generate password reset token and expiration
    const resetToken = generatePasswordResetToken()
    const resetExpiration = getPasswordResetExpiration()
    
    // Update user with reset token and expiration
    await updateUser(user.id, {
      password_reset_token: resetToken,
      password_reset_expires: resetExpiration
    })
    
    // Send password reset email
    const emailSent = await sendPasswordResetEmail(
      user.metadata.email,
      user.metadata.display_name,
      resetToken
    )
    
    if (!emailSent) {
      console.error('Failed to send password reset email')
      // Still return success to prevent email enumeration
    }
    
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we sent a password reset link.'
    })
    
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}