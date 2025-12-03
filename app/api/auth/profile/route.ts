import { NextRequest, NextResponse } from 'next/server'
import { updateUser } from '@/lib/db-utils'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId, 
      fullName, 
      username, 
      email, 
      department,
      address, 
      emergencyContactName, 
      emergencyContactPhone,
      phoneNumber,
      password,
      isAdmin
    } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (!fullName || !username || !email || !department) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    if (isAdmin) {
      if (!phoneNumber) {
        return NextResponse.json({ success: false, message: "Contact number is required" }, { status: 400 })
      }
    } else {
      if (!address || !emergencyContactName || !emergencyContactPhone) {
        return NextResponse.json({ success: false, message: "Missing address / emergency contact" }, { status: 400 })
      }
    }

    const payload: Record<string, any> = {
      fullName,
      username,
      email,
      department
    }

    if (isAdmin) {
      payload.phoneNumber = phoneNumber
    } else {
      payload.address = address
      payload.emergencyContactName = emergencyContactName
      payload.emergencyContactPhone = emergencyContactPhone
    }

    if (password) {
      payload.password = password
    }

    const result = updateUser(userId, payload)

    if (result.changes === 0) {
      return NextResponse.json({ error: 'User not found or no changes made' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
