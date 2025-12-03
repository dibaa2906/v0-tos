import { NextRequest, NextResponse } from 'next/server'
import { getAttendanceByUser, getAttendanceByUserAndDate, createAttendance, updateAttendance, getUserById } from '@/lib/db-utils'
import db from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const records = getAttendanceByUser(userId)
    
    return NextResponse.json({
      success: true,
      attendance: records || [],
      records: records || []
    })
  } catch (error: any) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch attendance' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, date, clockInTime, clockOutTime, clockInImage, clockOutImage, clockInLatitude, clockInLongitude, clockOutLatitude, clockOutLongitude, status } = body
    
    if (!userId || !date) {
      return NextResponse.json(
        { success: false, error: 'User ID and date are required' },
        { status: 400 }
      )
    }

    // Check if attendance record already exists for this date
    const existing = getAttendanceByUserAndDate(userId, date)
    
    if (existing) {
      // Update existing record
      const updates: any = {}
      if (clockInTime !== undefined) updates.clockInTime = clockInTime
      if (clockOutTime !== undefined) updates.clockOutTime = clockOutTime
      if (clockInImage !== undefined) updates.clockInImage = clockInImage
      if (clockOutImage !== undefined) updates.clockOutImage = clockOutImage
      if (clockInLatitude !== undefined) updates.clockInLatitude = clockInLatitude
      if (clockInLongitude !== undefined) updates.clockInLongitude = clockInLongitude
      if (clockOutLatitude !== undefined) updates.clockOutLatitude = clockOutLatitude
      if (clockOutLongitude !== undefined) updates.clockOutLongitude = clockOutLongitude
      if (status !== undefined) updates.status = status
      
      updateAttendance(existing.id, updates)
      
      // Notify admins when intern clocks in (if clockInTime is being set and wasn't set before)
      if (clockInTime && !existing.clockInTime) {
        try {
          const user = getUserById(userId)
          if (user) {
            const admins = db.prepare('SELECT id FROM users WHERE isAdmin = 1').all() as any[]
            const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            
            admins.forEach((admin) => {
              db.prepare(`
                INSERT INTO notifications (id, userId, targetUserId, type, title, message)
                VALUES (?, ?, ?, ?, ?, ?)
              `).run(
                `${notificationId}-${admin.id}`,
                userId,
                admin.id,
                'clock_in',
                'Clock In',
                `${user.fullName} just clocked in`
              )
            })
          }
        } catch (error) {
          console.error('Error creating clock-in notification:', error)
        }
      }
      
      // Notify admins when intern clocks out (if clockOutTime is being set and wasn't set before)
      if (clockOutTime && !existing.clockOutTime) {
        try {
          const user = getUserById(userId)
          if (user) {
            const admins = db.prepare('SELECT id FROM users WHERE isAdmin = 1').all() as any[]
            const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            
            admins.forEach((admin) => {
              db.prepare(`
                INSERT INTO notifications (id, userId, targetUserId, type, title, message)
                VALUES (?, ?, ?, ?, ?, ?)
              `).run(
                `${notificationId}-${admin.id}`,
                userId,
                admin.id,
                'clock_out',
                'Clock Out',
                `${user.fullName} just clocked out`
              )
            })
          }
        } catch (error) {
          console.error('Error creating clock-out notification:', error)
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Attendance updated successfully'
      })
    } else {
      // Create new record
      const attendance = {
        id: Date.now().toString(),
        userId,
        date,
        clockInTime: clockInTime || null,
        clockOutTime: clockOutTime || null,
        clockInImage: clockInImage || null,
        clockOutImage: clockOutImage || null,
        clockInLatitude: clockInLatitude || null,
        clockInLongitude: clockInLongitude || null,
        clockOutLatitude: clockOutLatitude || null,
        clockOutLongitude: clockOutLongitude || null,
        status: status || 'absent'
      }
      
      createAttendance(attendance)
      
      // Notify admins when intern clocks in
      if (clockInTime) {
        try {
          const user = getUserById(userId)
          if (user) {
            const admins = db.prepare('SELECT id FROM users WHERE isAdmin = 1').all() as any[]
            const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            
            admins.forEach((admin) => {
              db.prepare(`
                INSERT INTO notifications (id, userId, targetUserId, type, title, message)
                VALUES (?, ?, ?, ?, ?, ?)
              `).run(
                `${notificationId}-${admin.id}`,
                userId,
                admin.id,
                'clock_in',
                'Clock In',
                `${user.fullName} just clocked in`
              )
            })
          }
        } catch (error) {
          console.error('Error creating clock-in notification:', error)
        }
      }
      
      // Notify admins when intern clocks out
      if (clockOutTime) {
        try {
          const user = getUserById(userId)
          if (user) {
            const admins = db.prepare('SELECT id FROM users WHERE isAdmin = 1').all() as any[]
            const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            
            admins.forEach((admin) => {
              db.prepare(`
                INSERT INTO notifications (id, userId, targetUserId, type, title, message)
                VALUES (?, ?, ?, ?, ?, ?)
              `).run(
                `${notificationId}-${admin.id}`,
                userId,
                admin.id,
                'clock_out',
                'Clock Out',
                `${user.fullName} just clocked out`
              )
            })
          }
        } catch (error) {
          console.error('Error creating clock-out notification:', error)
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Attendance created successfully'
      })
    }
  } catch (error: any) {
    console.error('Error saving attendance:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save attendance' },
      { status: 500 }
    )
  }
}
