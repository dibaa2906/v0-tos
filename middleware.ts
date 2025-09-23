import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // For demo purposes, we'll handle auth client-side
  // In a real app, you'd validate tokens here
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
