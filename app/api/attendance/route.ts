import { NextRequest, NextResponse } from 'next/server'
import { 
  getAttendanceByUserAndDate, 
  getAttendanceHistoryByUser,
  createAttendanceRecord,
  updateAttendanceRecord,
  getUserByEmail
} from '@/lib/db-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const date = request.nextUrl.searchParams.get('date')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user by email
    const user = getUserByEmail(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 })
    }

    if (date) {
      // Get specific date record
      const record = getAttendanceByUserAndDate(user.id, date)
      return NextResponse.json({ success: true, record })
    } else {
      // Get all records for user
      const records = getAttendanceHistoryByUser(user.id)
      return NextResponse.json({ success: true, records })
    }
  } catch (error) {
    console.error('Get attendance error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action, recordId } = body

    if (!userId || !action) {
      return NextResponse.json({ error: 'User ID and action are required' }, { status: 400 })
    }

    // Get user by email
    const user = getUserByEmail(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found. Please log in again.' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toISOString()

    let record = getAttendanceByUserAndDate(user.id, today)

    if (action === 'clockIn') {
      if (record) {
        return NextResponse.json({ error: 'You have already clocked in today' }, { status: 400 })
      }

      // Create new attendance record
      const recordId = `attendance-${user.id}-${today}-${Date.now()}`
      createAttendanceRecord({
        id: recordId,
        userId: user.id,
        date: today,
        clockIn: now,
        status: 'present'
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Clocked in successfully',
        record: getAttendanceByUserAndDate(user.id, today)
      })
    } else if (action === 'clockOut') {
      if (!record) {
        return NextResponse.json({ error: 'Please clock in first' }, { status: 400 })
      }

      if (record.clockOut) {
        return NextResponse.json({ error: 'You have already clocked out today' }, { status: 400 })
      }

      // Update attendance record with clock out time
      const clockIn = new Date(record.clockIn!)
      const clockOut = new Date(now)
      const totalHours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)

      updateAttendanceRecord(record.id, {
        clockOut: now,
        totalHours
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Clocked out successfully',
        record: getAttendanceByUserAndDate(user.id, today)
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Attendance error:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}
