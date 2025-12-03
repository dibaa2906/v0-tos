import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET aggregated attendance reports
export async function GET(request: NextRequest) {
  try {
    const month = request.nextUrl.searchParams.get('month') // Format: YYYY-MM
    const department = request.nextUrl.searchParams.get('department')
    
    if (!month) {
      return NextResponse.json(
        { success: false, error: 'Month parameter is required (YYYY-MM)' },
        { status: 400 }
      )
    }

    // Build query to aggregate attendance data
    let query = `
      SELECT 
        u.id,
        u.fullName,
        u.email,
        u.department,
        COUNT(DISTINCT a.date) as totalDays,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as lateCount,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absentCount,
        SUM(CASE WHEN a.status = 'on_time' THEN 1 ELSE 0 END) as onTimeCount,
        SUM(CASE WHEN a.status = 'leave' THEN 1 ELSE 0 END) as leaveCount,
        GROUP_CONCAT(
          CASE 
            WHEN a.clockInTime IS NOT NULL AND a.clockOutTime IS NOT NULL 
            THEN 
              (
                (julianday(a.clockOutTime) - julianday(a.clockInTime)) * 24
              )
            ELSE NULL 
          END, ','
        ) as hoursList
      FROM users u
      LEFT JOIN attendance a ON u.id = a.userId 
        AND strftime('%Y-%m', a.date) = ?
      WHERE (u.isAdmin = 0 OR u.isAdmin IS NULL)
    `
    
    const params: any[] = [month]
    
    if (department) {
      query += ' AND u.department = ?'
      params.push(department)
    }
    
    query += ' GROUP BY u.id, u.fullName, u.email, u.department'
    query += ' ORDER BY u.fullName'

    const results = db.prepare(query).all(...params) as any[]
    
    // Calculate total hours for each user
    const reports = results.map((row: any) => {
      const hoursList = row.hoursList ? row.hoursList.split(',').filter((h: string) => h && !isNaN(parseFloat(h))) : []
      const totalHours = hoursList.reduce((sum: number, h: string) => sum + parseFloat(h), 0)
      
      return {
        userId: row.id,
        fullName: row.fullName,
        email: row.email,
        department: row.department,
        totalDays: row.totalDays || 0,
        lateCount: row.lateCount || 0,
        absentCount: row.absentCount || 0,
        onTimeCount: row.onTimeCount || 0,
        leaveCount: row.leaveCount || 0,
        totalHours: parseFloat(totalHours.toFixed(2))
      }
    })
    
    // Calculate aggregated totals
    const totals = {
      totalInterns: reports.length,
      totalLate: reports.reduce((sum, r) => sum + r.lateCount, 0),
      totalAbsent: reports.reduce((sum, r) => sum + r.absentCount, 0),
      totalOnTime: reports.reduce((sum, r) => sum + r.onTimeCount, 0),
      totalLeave: reports.reduce((sum, r) => sum + r.leaveCount, 0),
      totalHours: parseFloat(reports.reduce((sum, r) => sum + r.totalHours, 0).toFixed(2))
    }

    return NextResponse.json({ 
      success: true, 
      reports,
      totals,
      month,
      department: department || 'All'
    })
  } catch (error: any) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

