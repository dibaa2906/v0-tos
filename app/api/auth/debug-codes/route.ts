import { NextRequest, NextResponse } from 'next/server'
import { getAllStoredCodes } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const codes = getAllStoredCodes()
    return NextResponse.json({
      success: true,
      codes,
      count: codes.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error getting codes:', error)
    return NextResponse.json(
      { error: 'Failed to get codes' },
      { status: 500 }
    )
  }
}






