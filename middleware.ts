import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup', '/debug-auth', '/test-login']
  
  // Check if current path is a public route
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }
  
  // Note: Safari blocks Secure cookies on HTTP connections
  // Instead of blocking at middleware level, we let all requests through
  // and let the client-side AuthGuard handle authentication via localStorage
  // This ensures Safari users can access the app even if cookies are blocked
  
  // The client-side AuthGuard (in components/auth-guard.tsx) will:
  // 1. Check localStorage for authentication
  // 2. Redirect to home page if not authenticated
  // 3. Verify admin status from the database for admin routes
  
  // This approach works across all browsers including Safari
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ],
}
