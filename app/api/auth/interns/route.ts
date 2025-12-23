import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserById } from '@/lib/db-utils'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  
  if (id) {
    // Fetch single intern
    const intern = getUserById(id)
    if (!intern) {
      return NextResponse.json({ error: 'Intern not found' }, { status: 404 })
    }
    // Remove sensitive data
    const { password, ...safeIntern } = intern
    return NextResponse.json({ intern: safeIntern })
  }
  
  // Fetch all interns - check if phoneNumber column exists first
  try {
    const tableInfo = db.prepare("PRAGMA table_info(users)").all() as any[]
    const hasPhoneNumber = tableInfo.some(col => col.name === 'phoneNumber')
    
    let query: string
    if (hasPhoneNumber) {
      query = 'SELECT DISTINCT id, fullName, username, email, department, isAdmin, profilePhoto, createdAt, isPhoneVerified, isActive, address, emergencyContactName, emergencyContactPhone, phoneNumber FROM users WHERE isAdmin = 0 OR isAdmin IS NULL ORDER BY createdAt DESC'
    } else {
      query = 'SELECT DISTINCT id, fullName, username, email, department, isAdmin, profilePhoto, createdAt, isPhoneVerified, isActive, address, emergencyContactName, emergencyContactPhone FROM users WHERE isAdmin = 0 OR isAdmin IS NULL ORDER BY createdAt DESC'
    }
    
    const allUsers = db.prepare(query).all()
    // Additional deduplication by ID to ensure no duplicates
    const uniqueUsers = allUsers.reduce((acc: any[], user: any) => {
      if (!acc.find(u => u.id === user.id)) {
        acc.push(user)
      }
      return acc
    }, [])
    return NextResponse.json({ interns: uniqueUsers })
  } catch (error: any) {
    console.error('Error fetching interns:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch interns', interns: [] }, { status: 500 })
  }
}
