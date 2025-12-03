import { NextRequest, NextResponse } from 'next/server'
import { getUserById } from '@/lib/db-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get user ID from various sources
    const userId = 
      request.headers.get('x-user-id') || 
      request.nextUrl.searchParams.get('userId') ||
      request.cookies.get('currentUserId')?.value
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not provided' },
        { status: 401 }
      )
    }

    const user = getUserById(userId)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Remove password from response but keep isAdmin
    const { password, ...safeUser } = user
    
    // Ensure isAdmin is included (can be 0, 1, false, true, or undefined)
    const response = {
      ...safeUser,
      isAdmin: user.isAdmin === 1 || user.isAdmin === true || user.isAdmin === '1',
      isActive: user.isActive === 1 || user.isActive === true || user.isActive === '1' || user.isActive === undefined || user.isActive === null ? 1 : 0
    }
    
    return NextResponse.json({ success: true, user: response })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

