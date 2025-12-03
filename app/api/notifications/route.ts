import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserById } from '@/lib/db-utils'

export const dynamic = 'force-dynamic'

// GET notifications for a user
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const unreadOnly = request.nextUrl.searchParams.get('unreadOnly') === 'true'
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    let query = 'SELECT * FROM notifications WHERE targetUserId = ? OR (targetUserId IS NULL AND userId = ?)'
    const params: any[] = [userId, userId]
    
    if (unreadOnly) {
      query += ' AND isRead = 0'
    }
    
    query += ' ORDER BY createdAt DESC LIMIT 50'
    
    const notifications = db.prepare(query).all(...params) as any[]
    
    return NextResponse.json({ 
      success: true, 
      notifications: notifications.map(n => ({
        ...n,
        isRead: n.isRead === 1
      }))
    })
  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST create a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, targetUserId, type, title, message, metadata } = body
    
    if (!type || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'Type, title, and message are required' },
        { status: 400 }
      )
    }

    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    db.prepare(`
      INSERT INTO notifications (id, userId, targetUserId, type, title, message, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId || null,
      targetUserId || null,
      type,
      title,
      message,
      metadata ? JSON.stringify(metadata) : null
    )
    
    return NextResponse.json({ 
      success: true, 
      notification: { id, userId, targetUserId, type, title, message }
    })
  } catch (error: any) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create notification' },
      { status: 500 }
    )
  }
}

// PUT mark notification as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationId, markAllRead, userId } = body
    
    if (markAllRead && userId) {
      db.prepare('UPDATE notifications SET isRead = 1 WHERE (targetUserId = ? OR (targetUserId IS NULL AND userId = ?)) AND isRead = 0')
        .run(userId, userId)
      return NextResponse.json({ success: true, message: 'All notifications marked as read' })
    }
    
    if (notificationId) {
      db.prepare('UPDATE notifications SET isRead = 1 WHERE id = ?').run(notificationId)
      return NextResponse.json({ success: true, message: 'Notification marked as read' })
    }
    
    return NextResponse.json(
      { success: false, error: 'Notification ID or markAllRead with userId required' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update notification' },
      { status: 500 }
    )
  }
}


