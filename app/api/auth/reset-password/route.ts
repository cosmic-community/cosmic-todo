import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserByResetToken, updateUser } from '@/lib/cosmic'
import { isPasswordResetTokenValid } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()
    
    // Validate input
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }
    
    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }
    
    // Find user by reset token
    const user = await getUserByResetToken(token)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link. Please request a new password reset.' },
        { status: 400 }
      )
    }
    
    // Check if token is expired
    if (!user.metadata.password_reset_expires || 
        !isPasswordResetTokenValid(user.metadata.password_reset_expires)) {
      return NextResponse.json(
        { error: 'This reset link has expired. Please request a new password reset.' },
        { status: 400 }
      )
    }
    
    // Hash new password
    const newPasswordHash = await bcrypt.hash(password, 12)
    
    // Update user with new password and clear reset token
    await updateUser(user.id, {
      password_hash: newPasswordHash,
      password_reset_token: '',
      password_reset_expires: ''
    })
    
    return NextResponse.json({
      success: true,
      message: 'Your password has been reset successfully. You can now log in with your new password.'
    })
    
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}