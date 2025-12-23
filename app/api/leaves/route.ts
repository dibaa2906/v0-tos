import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserById, deleteLeaveApplication } from '@/lib/db-utils'

export const dynamic = 'force-dynamic'

// GET all leave applications with user details
export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status')
    const userId = request.nextUrl.searchParams.get('userId')
    const approverId = request.nextUrl.searchParams.get('approverId')
    const approverType = request.nextUrl.searchParams.get('approverType') // 'supervisor' or 'hod'
    const approverDept = request.nextUrl.searchParams.get('approverDept') // Department of approver
    
    console.log('📥 GET /api/leaves - Request params:', { status, userId, approverType, approverDept })
    
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
    
    // Filter based on approver type first (this takes precedence for department filtering)
    if (approverType === 'supervisor' && approverDept) {
      // Supervisors see pending leaves from their department
      // Also used for "My Dept" view to show pending leaves from a specific department
      // Use case-insensitive matching with trimming to handle whitespace/case differences
      const trimmedDept = approverDept.trim()
      // Use status parameter if provided, otherwise default to 'pending'
      const statusToUse = status || 'pending'
      conditions.push('la.status = ?')
      params.push(statusToUse)
      conditions.push('LOWER(TRIM(u.department)) = LOWER(TRIM(?))')
      params.push(trimmedDept)
      console.log('🔍 Filtering by department:', { approverDept: trimmedDept, approverType, status: statusToUse })
    } else if (approverType === 'hod' && !approverDept) {
      // HOD (encik shap) sees supervisor-approved leaves (only when not filtering by dept)
      // This is for the default HOD view, not "My Dept" view
      conditions.push('la.status = ?')
      params.push('supervisor_approved')
      console.log('🔍 Filtering HOD view (supervisor_approved)')
    } else if (status) {
      // If only status is provided (e.g., view=all), filter by status only
      // Only add if approverType wasn't already handled above
      conditions.push('la.status = ?')
      params.push(status)
      console.log('🔍 Filtering by status only:', { status })
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }
    
    query += ' ORDER BY la.appliedAt DESC'
    
    console.log('📋 SQL Query:', query)
    console.log('📋 SQL Params:', params)
    
    const leaves = db.prepare(query).all(...params) as any[]
    
    console.log('📋 Found leaves:', leaves.length)
    
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

    // Get leave application details with user info
    const leave = db.prepare(`
      SELECT la.*, u.department as userDepartment 
      FROM leave_applications la 
      JOIN users u ON la.userId = u.id 
      WHERE la.id = ?
    `).get(leaveId) as any
    
    if (!leave) {
      return NextResponse.json(
        { success: false, error: 'Leave application not found' },
        { status: 404 }
      )
    }

    // Get approver info to check if HOD is approving their own department's leave
    const approver = approverId ? getUserById(approverId) : null
    const isHODApprovingOwnDept = approverType === 'hod' && 
                                   approver?.department?.toLowerCase() === 'pentadbiran' &&
                                   leave.userDepartment?.toLowerCase() === 'pentadbiran'
    
    console.log('🔍 Approval Debug:', {
      leaveId,
      approverType,
      approverId,
      approverDepartment: approver?.department,
      leaveUserDepartment: leave.userDepartment,
      isHODApprovingOwnDept,
      currentStatus: leave.status
    })

    // Validate approval stage
    if (approverType === 'hod') {
      // For Pentadbiran department: HOD (Encik Shap) can approve/reject directly
      // This will auto-complete both supervisor and final review stages
      if (isHODApprovingOwnDept) {
        // Allow HOD to approve/reject their own department's leaves regardless of status
        // (will handle both pending and supervisor_approved)
        if (leave.status === 'approved_hod' || leave.status === 'rejected') {
          return NextResponse.json(
            { success: false, error: 'Leave application has already been processed' },
            { status: 400 }
          )
        }
      } else {
        // For other departments: HOD can only approve if supervisor has already approved
        if (leave.status !== 'supervisor_approved') {
          return NextResponse.json(
            { success: false, error: 'Leave must be approved by supervisor first' },
            { status: 400 }
          )
        }
      }
    } else if (approverType === 'supervisor') {
      // Supervisor can only approve if status is pending
      // Exception: If intern is from Pentadbiran, supervisor approval is skipped (HOD handles it)
      if (leave.userDepartment?.toLowerCase() === 'pentadbiran') {
        return NextResponse.json(
          { success: false, error: 'Pentadbiran department leaves are approved directly by Encik Shap' },
          { status: 400 }
        )
      }
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
        // For Pentadbiran department: HOD approval completes both supervisor and final review
        if (isHODApprovingOwnDept) {
          status = 'approved_hod'
          updateFields = {
            status: 'approved_hod',
            supervisorApprovedAt: now, // Auto-complete supervisor review
            hodApprovedAt: now, // Final approval
            reviewerNote: reviewerNote || null
          }
          notificationMessage = 'Your leave application has been approved by Encik Shap (both supervisor and final review completed)'
          console.log('✅ HOD approving own dept - setting both timestamps:', { supervisorApprovedAt: now, hodApprovedAt: now })
        } else {
          // Normal flow: HOD approving supervisor-approved leave from other departments
          status = 'approved_hod'
          updateFields = {
            status: 'approved_hod',
            hodApprovedAt: now,
            reviewerNote: reviewerNote || null
          }
          notificationMessage = 'Your leave application has been approved by Encik Shap'
        }
      } else if (action === 'reject') {
        // For Pentadbiran department: HOD rejection marks both supervisor and final review as rejected
        if (isHODApprovingOwnDept) {
          status = 'rejected'
          updateFields = {
            status: 'rejected',
            supervisorRejectedAt: now, // Mark supervisor review as rejected
            rejectedAt: now,
            rejectedBy: approverId || null,
            reviewerNote: reviewerNote || null
          }
          notificationMessage = 'Your leave application has been rejected by Encik Shap'
        } else {
          // Normal flow: HOD rejecting supervisor-approved leave from other departments
          status = 'rejected'
          updateFields = {
            status: 'rejected',
            rejectedAt: now,
            rejectedBy: approverId || null,
            reviewerNote: reviewerNote || null
          }
          notificationMessage = 'Your leave application has been rejected by Encik Shap'
        }
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
    
    console.log('📝 Updating leave:', { leaveId, fields, values, updateFields })
    
    const stmt = db.prepare(`UPDATE leave_applications SET ${fields} WHERE id = ?`)
    const result = stmt.run(...values, leaveId)
    
    console.log('✅ Leave updated:', { leaveId, changes: result.changes, status })
    
    if (result.changes === 0) {
      console.error('⚠️ No rows updated for leave:', leaveId)
      return NextResponse.json(
        { success: false, error: 'Failed to update leave application. It may have already been processed.' },
        { status: 400 }
      )
    }

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
// Track recent submissions to prevent duplicates (within 2 seconds)
const recentSubmissions = new Map<string, number>()
const processedRequestIds = new Set<string>()

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, leaveType, startDate, endDate, reason, mcFile, requestId } = body
    const headerRequestId = request.headers.get('X-Request-ID')
    const finalRequestId = requestId || headerRequestId || `server-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    console.log('📥 PUT /api/leaves - Request received:', { 
      requestId: finalRequestId,
      userId, 
      startDate, 
      endDate, 
      reason: reason ? 'provided' : 'missing', 
      hasMcFile: !!mcFile 
    })
    
    // Check if this exact request ID was already processed
    if (processedRequestIds.has(finalRequestId)) {
      console.log('⚠️ Duplicate request ID detected, rejecting:', finalRequestId)
      return NextResponse.json(
        { success: false, error: 'Duplicate request detected. This request was already processed.' },
        { status: 409 }
      )
    }
    
    // Mark this request ID as processed
    processedRequestIds.add(finalRequestId)
    
    // Clean up old request IDs (older than 10 seconds)
    setTimeout(() => {
      processedRequestIds.delete(finalRequestId)
    }, 10000)
    
    if (!userId || !startDate || !endDate || !reason) {
      console.error('PUT /api/leaves - Missing required fields:', { userId: !!userId, startDate: !!startDate, endDate: !!endDate, reason: !!reason })
      return NextResponse.json(
        { success: false, error: 'User ID, start date, end date, and reason are required' },
        { status: 400 }
      )
    }

    // Create a unique key for this submission to prevent duplicates
    const submissionKey = `${userId}-${startDate}-${endDate}-${leaveType || 'regular'}`
    const now = Date.now()
    const lastSubmission = recentSubmissions.get(submissionKey)
    
    // If same submission within 2 seconds, reject as duplicate
    if (lastSubmission && (now - lastSubmission) < 2000) {
      console.log('⚠️ Duplicate submission detected within 2 seconds, rejecting:', submissionKey)
      return NextResponse.json(
        { success: false, error: 'Duplicate submission detected. Please wait a moment before submitting again.' },
        { status: 429 }
      )
    }
    
    // Record this submission
    recentSubmissions.set(submissionKey, now)
    
    // Clean up old entries (older than 5 seconds)
    for (const [key, timestamp] of recentSubmissions.entries()) {
      if (now - timestamp > 5000) {
        recentSubmissions.delete(key)
      }
    }

    // Check if a duplicate leave already exists (same user, dates, and type)
    const existingLeave = db.prepare(`
      SELECT id FROM leave_applications 
      WHERE userId = ? AND startDate = ? AND endDate = ? AND leaveType = ? AND status = 'pending'
      LIMIT 1
    `).get(userId, startDate, endDate, leaveType || 'regular') as any
    
    if (existingLeave) {
      console.log('⚠️ Duplicate pending leave already exists:', existingLeave.id)
      return NextResponse.json(
        { success: false, error: 'You already have a pending leave application for these dates.' },
        { status: 409 }
      )
    }
    
    const leaveId = `leave-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    try {
      const result = db.prepare(`
        INSERT INTO leave_applications (id, userId, leaveType, startDate, endDate, reason, status, mcFile)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
      `).run(leaveId, userId, leaveType || 'regular', startDate, endDate, reason, mcFile || null)
      
      console.log('✅ Leave created:', { leaveId, changes: result.changes })
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

// DELETE a leave application (only by the intern who created it, and only if pending)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leaveId = searchParams.get('leaveId')
    const userId = searchParams.get('userId')
    
    console.log('🗑️ DELETE request received:', { leaveId, userId })
    
    if (!leaveId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Leave ID and User ID are required' },
        { status: 400 }
      )
    }

    // Get leave application to verify ownership and status
    const leave = db.prepare('SELECT * FROM leave_applications WHERE id = ?').get(leaveId) as any
    
    console.log('🗑️ Found leave application:', { 
      id: leave?.id, 
      userId: leave?.userId, 
      requestedUserId: userId,
      status: leave?.status 
    })
    
    if (!leave) {
      return NextResponse.json(
        { success: false, error: 'Leave application not found' },
        { status: 404 }
      )
    }

    // Verify the user owns this leave application
    if (leave.userId !== userId) {
      console.log('🗑️ Ownership mismatch:', { leaveUserId: leave.userId, requestedUserId: userId })
      return NextResponse.json(
        { success: false, error: 'You can only delete your own leave applications' },
        { status: 403 }
      )
    }

    // Only allow deletion if status is pending
    if (leave.status !== 'pending') {
      console.log('🗑️ Status check failed:', { status: leave.status })
      return NextResponse.json(
        { success: false, error: 'You can only delete pending leave applications' },
        { status: 400 }
      )
    }

    // Delete the leave application by specific ID
    console.log('🗑️ Deleting leave application with ID:', leaveId)
    const result = deleteLeaveApplication(leaveId)
    
    console.log('🗑️ Delete result:', { changes: result.changes })
    
    if (result.changes === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete leave application' },
        { status: 500 }
      )
    }

    // Verify only one was deleted
    const remaining = db.prepare('SELECT id FROM leave_applications WHERE id = ?').get(leaveId)
    if (remaining) {
      console.error('🗑️ ERROR: Leave application still exists after deletion!')
      return NextResponse.json(
        { success: false, error: 'Failed to delete leave application' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Leave application deleted successfully',
      deletedId: leaveId
    })
  } catch (error: any) {
    console.error('Error deleting leave application:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete leave application' },
      { status: 500 }
    )
  }
}

