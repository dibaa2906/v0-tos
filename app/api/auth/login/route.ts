import { NextRequest, NextResponse } from 'next/server'
import { getUserByUsername } from '@/lib/db-utils'

export async function POST(request: NextRequest) {
  try {
    // Initialize database connection if needed (lazy initialization)
    try {
      require('@/lib/db')
    } catch (dbInitError: any) {
      if (dbInitError?.code === 'SQLITE_BUSY' || dbInitError?.message?.includes('database is locked')) {
        console.error('❌ Database is locked during initialization')
        return NextResponse.json(
          { error: 'Database is temporarily busy. Please close any database viewing tools and try again.' },
          { status: 503 }
        )
      }
      throw dbInitError
    }
    const { username, password } = await request.json()

    // Fast validation - return immediately if missing
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Get user from database - optimized query
    const user = getUserByUsername(username)

    // Fast fail - user not found
    if (!user) {
      return NextResponse.json(
        { error: 'Username not found. Please check your username and try again.' },
        { status: 401 }
      )
    }

    // Fast password check - fail immediately on mismatch
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Incorrect password. Please try again.' },
        { status: 401 }
      )
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    // Create response
    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword
    })

    // Set authentication cookies for middleware
    // For localhost, we need to avoid Secure flag (Safari blocks secure cookies on HTTP)
    const host = request.headers.get('host') || ''
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')
    
    // Use manual Set-Cookie header for localhost to avoid Secure flag
    if (isLocalhost) {
      const maxAge = 60 * 60 * 24 * 7 // 7 days
      response.headers.set('Set-Cookie', [
        `isAuthenticated=true; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`,
        `currentUserId=${user.id}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`
      ].join(', '))
    } else {
      // For production, use secure cookies
      response.cookies.set('isAuthenticated', 'true', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      })
      response.cookies.set('currentUserId', user.id, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      })
    }

    return response

  } catch (error: any) {
    // Fast error response
    let errorMessage = 'Failed to process login. Please try again.'
    if (error?.code === 'SQLITE_BUSY' || error?.message?.includes('database is locked')) {
      errorMessage = 'Database is temporarily busy. Please wait a moment and try again.'
    } else if (error?.message) {
      errorMessage = `Login error: ${error.message}`
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}


