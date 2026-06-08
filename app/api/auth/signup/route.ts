import { NextRequest, NextResponse } from 'next/server'

// Changed: Signup disabled - returns 403 for all requests
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Signup is currently disabled. Please contact an administrator for access.' },
    { status: 403 }
  )
}