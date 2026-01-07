import { NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'

export async function GET() {
  try {
    const response = await cosmic.objects
      .find({ type: 'lists' })
      .props(['id', 'title', 'slug', 'metadata'])
    
    return NextResponse.json({ lists: response.objects })
  } catch (error) {
    // Handle 404 (no objects found) as empty array
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return NextResponse.json({ lists: [] })
    }
    console.error('Error fetching lists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lists' },
      { status: 500 }
    )
  }
}