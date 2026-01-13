import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from '@/lib/cosmic'
import { createToken, setAuthCookie } from '@/lib/auth'
import { CheckboxPosition, ColorTheme, StyleTheme } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    // Find user
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.metadata.password_hash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Check if email is verified
    if (!user.metadata.email_verified) {
      return NextResponse.json(
        { error: 'Please verify your email before logging in' },
        { status: 403 }
      )
    }
    
    // Extract user preferences
    const checkboxPosition = user.metadata.checkbox_position
    const colorTheme = user.metadata.color_theme
    const styleTheme = user.metadata.style_theme
    
    // Helper function to extract value from potential object or string
    const extractValue = <T extends string>(value: T | { key: string; value: string } | undefined, defaultValue: T): T => {
      if (!value) return defaultValue
      if (typeof value === 'object' && 'key' in value) {
        return value.key as T
      }
      return value as T
    }
    
    // Create auth token and user object with preferences
    const authUser = {
      id: user.id,
      email: user.metadata.email,
      display_name: user.metadata.display_name,
      email_verified: user.metadata.email_verified,
      checkbox_position: extractValue<CheckboxPosition>(checkboxPosition, 'left'),
      color_theme: extractValue<ColorTheme>(colorTheme, 'system'),
      style_theme: extractValue<StyleTheme>(styleTheme, 'default')
    }
    
    const token = await createToken(authUser)
    
    // Set auth cookie
    await setAuthCookie(token)
    
    return NextResponse.json({
      success: true,
      user: authUser
    })
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}