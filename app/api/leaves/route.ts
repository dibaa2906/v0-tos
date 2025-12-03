import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserById } from '@/lib/db-utils'

export const dynamic = 'force-dynamic'

// GET all leave applications with user details
export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status')
    const userId = request.nextUrl.searchParams.get('userId')
    const approverId = request.nextUrl.searchParams.get('approverId')
    const approverType = request.nextUrl.searchParams.get('approverType') // 'supervisor' or 'hod'
    const approverDept = request.nextUrl.searchParams.get('approverDept') // Department of approver
    
    let query = `
      SELECT 
        la.*,
        u.fullName,
        u.email,
        u.department,
        u.profilePhoto
      FROM leave_applications la
      JOIN users u ON la.userId = u.id
    `
    
    const params: any[] = []
    const conditions: string[] = []
    
    if (userId) {
      conditions.push('la.userId = ?')
      params.push(userId)
    }
    
    if (status) {
      conditions.push('la.status = ?')
      params.push(status)
    }
    
    // Filter based on approver type
    if (approverType === 'supervisor' && approverDept) {
      // Supervisors see pending leaves from their department
      conditions.push('la.status = ?')
      params.push('pending')
      conditions.push('u.department = ?')
      params.push(approverDept)
    } else if (approverType === 'hod') {
      // HOD (encik shap) sees supervisor-approved leaves
      conditions.push('la.status = ?')
      params.push('supervisor_approved')
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }
    
    query += ' ORDER BY la.appliedAt DESC'
    
    const leaves = db.prepare(query).all(...params) as any[]
    
    return NextResponse.json({ success: true, leaves })
  } catch (error: any) {
    console.error('Error fetching leaves:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch leaves' },
      { status: 500 }
    )
  }
}

// POST approve/reject leave OR create new leave application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leaveId, action, reviewerNote, approverType, approverId, userId, leaveType, startDate, endDate, reason, mcFile } = body
    
    console.log('POST /api/leaves - Request body:', { leaveId, action, userId, startDate, endDate, reason: reason ? 'provided' : 'missing', hasMcFile: !!mcFile }) 
    
    // Check if this is a create request (has userId, startDate, endDate, reason but no leaveId or action)
    const isCreateRequest = userId && startDate && endDate && reason && !leaveId && !action
    
    if (isCreateRequest) {
      // This is a create request

      // Verify user exists
      const user = getUserById(userId)
      if (!user) {
        console.error('PUT /api/leaves - User not found:', userId)
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        )
      }

      const leaveIdNew = `leave-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      try {
        db.prepare(`
          INSERT INTO leave_applications (id, userId, leaveType, startDate, endDate, reason, status, mcFile)
          VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
        `).run(leaveIdNew, userId, leaveType || 'regular', startDate, endDate, reason, mcFile || null)
        
        console.log('PUT /api/leaves - Successfully inserted leave application:', leaveIdNew)
      } catch (dbError: any) {
        console.error('Database error creating leave application:', dbError)
        return NextResponse.json(
          { success: false, error: `Database error: ${dbError.message || 'Failed to create leave application'}` },
          { status: 500 }
        )
      }

      // Notify supervisor (head of department) about new leave application
      try {
        if (user && user.department) {
          // Find supervisor (admin) for this department (case-insensitive)
          const supervisor = db.prepare(`
            SELECT id FROM users 
            WHERE isAdmin = 1 AND LOWER(TRIM(department)) = LOWER(TRIM(?))
            LIMIT 1
          `).get(user.department) as any
          
          if (supervisor) {
            const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            db.prepare(`
              INSERT INTO notifications (id, userId, targetUserId, type, title, message)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(
              notificationId,
              userId,
              supervisor.id,
              'leave_application',
              'New Leave Application',
              `${user.fullName} applied for leave`
            )
          }
        }
      } catch (error) {
        console.error('Error creating leave application notification:', error)
        // Don't fail the application if notification fails
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Leave application submitted successfully',
        leaveId: leaveIdNew
      })
    }
    
    // Otherwise, this is an approve/reject request
    // action: 'approve' or 'reject'
    // approverType: 'supervisor' or 'hod'
    // approverId: ID of the admin approving/rejecting
    
    if (!leaveId || !action || !approverType) {
      return NextResponse.json(
        { success: false, error: 'Leave ID, action, and approver type are required' },
        { status: 400 }
      )
    }

    // Get leave application details
    const leave = db.prepare('SELECT * FROM leave_applications WHERE id = ?').get(leaveId) as any
    
    if (!leave) {
      return NextResponse.json(
        { success: false, error: 'Leave application not found' },
        { status: 404 }
      )
    }

    // Validate approval stage
    if (approverType === 'hod') {
      // HOD can only approve if supervisor has already approved
      if (leave.status !== 'supervisor_approved') {
        return NextResponse.json(
          { success: false, error: 'Leave must be approved by supervisor first' },
          { status: 400 }
        )
      }
    } else if (approverType === 'supervisor') {
      // Supervisor can only approve if status is pending
      if (leave.status !== 'pending') {
        return NextResponse.json(
          { success: false, error: 'Leave application has already been processed' },
          { status: 400 }
        )
      }
    }

    const now = new Date().toISOString()
    let status = ''
    let updateFields: any = {}
    let notificationMessage = ''

    if (approverType === 'supervisor') {
      if (action === 'approve') {
        status = 'supervisor_approved'
        updateFields = {
          status: 'supervisor_approved',
          supervisorApprovedAt: now,
          reviewerNote: reviewerNote || null
        }
        notificationMessage = 'Your leave application has been approved by your supervisor and is now pending final review with Encik Shap'
        
        // Notify final reviewer (Encik Shap - Pentadbiran department) about supervisor-approved leave
        try {
          const hod = db.prepare(`
            SELECT id FROM users 
            WHERE isAdmin = 1 AND department = 'Pentadbiran'
            LIMIT 1
          `).get() as any
          
          if (hod) {
            const intern = getUserById(leave.userId)
            if (intern) {
              const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
              db.prepare(`
                INSERT INTO notifications (id, userId, targetUserId, type, title, message)
                VALUES (?, ?, ?, ?, ?, ?)
              `).run(
                notificationId,
                leave.userId,
                hod.id,
                'leave_application',
                'Leave Application Ready for Final Review',
                `${intern.fullName}'s leave application has been approved by the supervisor and is ready for your final review`
              )
            }
          }
        } catch (error) {
          console.error('Error notifying HOD:', error)
        }
      } else if (action === 'reject') {
        status = 'rejected'
        updateFields = {
          status: 'rejected',
          supervisorRejectedAt: now,
          rejectedAt: now,
          rejectedBy: approverId || null,
          reviewerNote: reviewerNote || null
        }
        notificationMessage = 'Your leave application has been rejected by your supervisor'
      }
    } else if (approverType === 'hod') {
      if (action === 'approve') {
        status = 'approved_hod'
        updateFields = {
          status: 'approved_hod',
          hodApprovedAt: now,
          reviewerNote: reviewerNote || null
        }
        notificationMessage = 'Your leave application has been approved by Encik Shap'
      } else if (action === 'reject') {
        status = 'rejected'
        updateFields = {
          status: 'rejected',
          rejectedAt: now,
          rejectedBy: approverId || null,
          reviewerNote: reviewerNote || null
        }
        notificationMessage = 'Your leave application has been rejected by Encik Shap'
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid approver type. Use "supervisor" or "hod"' },
        { status: 400 }
      )
    }

    // Build update query
    const fields = Object.keys(updateFields).map(key => `${key} = ?`).join(', ')
    const values = Object.values(updateFields)
    
    const stmt = db.prepare(`UPDATE leave_applications SET ${fields} WHERE id = ?`)
    stmt.run(...values, leaveId)

    // Notify intern about leave approval/rejection
    try {
      const intern = getUserById(leave.userId)
      if (intern) {
        const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const notificationType = action === 'approve' ? 'leave_approved' : 'leave_rejected'
        const notificationTitle = action === 'approve' 
          ? approverType === 'supervisor' ? 'Leave Approved by Supervisor' : 'Leave Approved by Encik Shap'
          : approverType === 'supervisor' ? 'Leave Rejected by Supervisor' : 'Leave Rejected by Encik Shap'
        
        db.prepare(`
          INSERT INTO notifications (id, userId, targetUserId, type, title, message)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          notificationId,
          approverId || null,
          leave.userId,
          notificationType,
          notificationTitle,
          notificationMessage
        )
      }
    } catch (error) {
      console.error('Error creating leave notification:', error)
      // Don't fail the approval/rejection if notification fails
    }

    return NextResponse.json({ 
      success: true, 
      message: `Leave ${action}d successfully by ${approverType}`,
      status
    })
  } catch (error: any) {
    console.error('Error updating leave:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update leave' },
      { status: 500 }
    )
  }
}

// PUT create a new leave application
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, leaveType, startDate, endDate, reason, mcFile } = body
    
    console.log('PUT /api/leaves - Request body:', { userId, startDate, endDate, reason: reason ? 'provided' : 'missing', hasMcFile: !!mcFile })
    
    if (!userId || !startDate || !endDate || !reason) {
      console.error('PUT /api/leaves - Missing required fields:', { userId: !!userId, startDate: !!startDate, endDate: !!endDate, reason: !!reason })
      return NextResponse.json(
        { success: false, error: 'User ID, start date, end date, and reason are required' },
        { status: 400 }
      )
    }

    const leaveId = `leave-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    try {
      db.prepare(`
        INSERT INTO leave_applications (id, userId, leaveType, startDate, endDate, reason, status, mcFile)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
      `).run(leaveId, userId, leaveType || 'regular', startDate, endDate, reason, mcFile || null)
    } catch (dbError: any) {
      console.error('Database error creating leave application:', dbError)
      return NextResponse.json(
        { success: false, error: `Database error: ${dbError.message || 'Failed to create leave application'}` },
        { status: 500 }
      )
    }

    // Notify supervisor (head of department) about new leave application
    try {
      const user = getUserById(userId)
      if (user && user.department) {
        // Find supervisor (admin) for this department (case-insensitive)
        const supervisor = db.prepare(`
          SELECT id FROM users 
          WHERE isAdmin = 1 AND LOWER(TRIM(department)) = LOWER(TRIM(?))
          LIMIT 1
        `).get(user.department) as any
        
        if (supervisor) {
          const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          db.prepare(`
            INSERT INTO notifications (id, userId, targetUserId, type, title, message)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(
            notificationId,
            userId,
            supervisor.id,
            'leave_application',
            'New Leave Application',
            `${user.fullName} applied for leave`
          )
        }
      }
    } catch (error) {
      console.error('Error creating leave application notification:', error)
      // Don't fail the application if notification fails
    }

    console.log('PUT /api/leaves - Successfully created leave application:', leaveId)
    return NextResponse.json({ 
      success: true, 
      message: 'Leave application submitted successfully',
      leaveId
    })
  } catch (error: any) {
    console.error('Error creating leave application:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create leave application' },
      { status: 500 }
    )
  }
}

