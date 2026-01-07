import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, color } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Generate a slug from the name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const response = await cosmic.objects.insertOne({
      title: name.trim(),
      slug: slug,
      type: 'lists',
      metadata: {
        name: name.trim(),
        description: description?.trim() || '',
        color: color || '#3b82f6'
      }
    })

    // Changed: Return the full list object with all properties
    return NextResponse.json({ 
      list: {
        id: response.object.id,
        slug: response.object.slug,
        title: response.object.title,
        type: response.object.type,
        created_at: response.object.created_at,
        modified_at: response.object.modified_at,
        metadata: response.object.metadata
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating list:', error)
    return NextResponse.json(
      { error: 'Failed to create list' },
      { status: 500 }
    )
  }
}