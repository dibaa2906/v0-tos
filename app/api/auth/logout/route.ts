import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' })
  
  // Clear authentication cookies
  response.cookies.delete('isAuthenticated')
  response.cookies.delete('currentUserId')
  
  return response
}



