import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getUserById } from '@/lib/cosmic'
import { CheckboxPosition, ColorTheme, StyleTheme } from '@/types'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    // Changed: Fetch fresh user data to get latest preferences
    const user = await getUserById(session.user.id)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Changed: Extract checkbox_position, color_theme, and style_theme from metadata
    // Handle both string values and object values with key property
    const checkboxPosition = user.metadata.checkbox_position
    const colorTheme = user.metadata.color_theme
    const styleTheme = user.metadata.style_theme
    
    // Changed: Helper function to extract value from potential object or string
    const extractValue = <T extends string>(value: T | { key: string; value: string } | undefined, defaultValue: T): T => {
      if (!value) return defaultValue
      if (typeof value === 'object' && 'key' in value) {
        return value.key as T
      }
      return value as T
    }
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.metadata.email,
        display_name: user.metadata.display_name,
        email_verified: user.metadata.email_verified,
        // Changed: Safely extract values handling both string and object formats
        checkbox_position: extractValue<CheckboxPosition>(checkboxPosition, 'left'),
        color_theme: extractValue<ColorTheme>(colorTheme, 'system'),
        style_theme: extractValue<StyleTheme>(styleTheme, 'default')
      }
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { error: 'Failed to check authentication' },
      { status: 500 }
    )
  }
}