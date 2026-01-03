import { NextRequest, NextResponse } from 'next/server'
import {
  createLeaveApplication,
  getLeaveApplicationsByUser,
  getUserByEmail
} from '@/lib/db-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user by email
    const user = getUserByEmail(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 })
    }

    const applications = getLeaveApplicationsByUser(user.id)
    return NextResponse.json({ success: true, applications })
  } catch (error) {
    console.error('Get leave applications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, leaveType, startDate, endDate, days, reason } = body

    if (!userId || !leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json({ 
        error: 'User ID, leave type, start date, end date, and reason are required' 
      }, { status: 400 })
    }

    // Get user by email
    const user = getUserByEmail(userId)
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found. Please log in again.' 
      }, { status: 400 })
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    if (end < start) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
    }

    if (start < new Date()) {
      return NextResponse.json({ error: 'Start date cannot be in the past' }, { status: 400 })
    }

    // Create leave application
    const applicationId = `leave-${user.id}-${Date.now()}`
    createLeaveApplication({
      id: applicationId,
      userId: user.id,
      leaveType,
      startDate,
      endDate,
      days: days || Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
      reason,
      status: 'pending'
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Leave application submitted successfully' 
    })
  } catch (error: any) {
    console.error('Create leave application error:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}

