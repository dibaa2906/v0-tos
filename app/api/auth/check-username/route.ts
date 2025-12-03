import { NextRequest, NextResponse } from 'next/server'
import { getUserByUsername } from '@/lib/db-utils'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { available: false, error: 'Username is required' },
        { status: 400 }
      )
    }

    // Check if username exists
    const existingUser = getUserByUsername(username)
    
    return NextResponse.json({
      available: !existingUser,
      username: username
    })
  } catch (error) {
    console.error('Check username error:', error)
    return NextResponse.json(
      { available: false, error: 'Failed to check username' },
      { status: 500 }
    )
  }
}


