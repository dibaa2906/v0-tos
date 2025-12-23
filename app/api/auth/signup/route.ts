import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByUsername, getNextUserId } from '@/lib/db-utils'
import { generateVerificationCode, saveVerificationCode, verifyCode, getAllStoredCodes } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'
import db from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, username, address, department, phoneNumber, emergencyContactName, emergencyContactPhone, email, password, institution, lecturerContactName, lecturerContactPhone } = body

    if (!fullName || !username || !address || !department || !phoneNumber || !emergencyContactName || !emergencyContactPhone || !email || !password || !institution || !lecturerContactName || !lecturerContactPhone) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 })
    }

    // Check if username already exists
    const existingUser = getUserByUsername(username)
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username existed. Choose other username' },
        { status: 400 }
      )
    }

    // Normalize email (lowercase, trim) for consistent storage
    const normalizedEmail = email.toLowerCase().trim()
    console.log('📧 Normalized email for storage:', normalizedEmail, 'Original:', email)
    
    // NOTE: Verification code will be sent AFTER photo is captured (in separate API call)

    // Generate incremental user ID (01, 02, 03, etc.)
    const userId = getNextUserId()
    console.log('🆔 Generated user ID:', userId)

    // Store user data temporarily (in session storage or local state)
    // We'll save to database after verification
    const tempUser = {
      id: userId,
      fullName,
      username,
      address,
      department,
      emergencyContact: {
        name: emergencyContactName,
        phoneNumber: emergencyContactPhone
      },
      email: normalizedEmail, // Use normalized email
      password,
      phoneNumber,
      institution,
      lecturerContactName,
      lecturerContactPhone
    }

    // Return response - verification code will be sent after photo capture
    return NextResponse.json({ 
      success: true, 
      userId: userId, // Return the generated user ID
      userData: {
        id: userId,
        fullName,
        username,
        address,
        department,
        emergencyContact: {
          name: emergencyContactName,
          phoneNumber: emergencyContactPhone
        },
        email: normalizedEmail, // Use normalized email consistently
        password,
        phoneNumber: phoneNumber || '', // Ensure phoneNumber is always included
        institution,
        lecturerContactName,
        lecturerContactPhone
      },
      message: 'Please capture your profile photo to continue'
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to process signup' },
      { status: 500 }
    )
  }
}

// Send verification code after photo is captured
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userData } = body

    if (!userData || !userData.email) {
      return NextResponse.json(
        { error: 'User data and email are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = userData.email.toLowerCase().trim()
    const fullName = userData.fullName || 'User'

    // Generate verification code
    const code = generateVerificationCode()
    console.log('🔑 Generated code after photo capture:', code, 'Type:', typeof code, 'Length:', code.length)
    console.log('📧 Normalized email for storage:', normalizedEmail)
    console.log('📧 Original email from userData:', userData.email)
    
    // Save verification code to database using normalized email
    try {
      saveVerificationCode(normalizedEmail, code)
      
      // Verify it was saved correctly
      const allCodesAfterSave = getAllStoredCodes()
      console.log('✅ Code saved. Current stored codes:', allCodesAfterSave)
      const savedCode = allCodesAfterSave.find(c => c.email === normalizedEmail)
      if (savedCode) {
        console.log('✅ Confirmed code is stored:', { email: savedCode.email, code: savedCode.code, expiresIn: savedCode.expiresIn })
      } else {
        console.warn('⚠️ Code was not found in storage immediately after save')
        // Try to retrieve it again
        const retryCodes = getAllStoredCodes()
        console.log('🔄 Retry - All codes in database:', retryCodes)
      }
    } catch (saveError: any) {
      console.error('❌ Failed to save verification code:', saveError)
      console.error('Error details:', {
        message: saveError?.message,
        code: saveError?.code
      })
      // Continue anyway - the code will be in the response
      console.warn('⚠️ Continuing despite verification code save failure')
    }

    // Send verification email (use original email from userData for sending)
    const emailToSend = userData.email || normalizedEmail
    console.log('📧 Sending email to:', emailToSend)
    const emailSent = await sendVerificationEmail(emailToSend, code, fullName)
    
    console.log('📧 Email sending result:', {
      sent: emailSent.sent,
      hasError: !!emailSent.error,
      error: emailSent.error
    })
    
    if (emailSent.sent) {
      console.log('✅ Verification email sent successfully to:', userData.email)
    } else {
      console.log('⚠️ Email sending failed:', emailSent.error || 'Unknown error')
      console.log('⚠️ Verification code available in response for testing')
    }

    // Ensure userData has all required fields including profilePhoto
    const updatedUserData = {
      ...userData,
      email: normalizedEmail, // Ensure normalized email is used
      profilePhoto: userData.profilePhoto || null, // Ensure profilePhoto is included
      phoneNumber: userData.phoneNumber || '', // Ensure phoneNumber is included
      verificationCode: code // Include code in userData as fallback
    }
    
    // Only return code if email failed (for debugging), otherwise don't expose it
    return NextResponse.json({ 
      success: true, 
      verificationCode: code, // Always return code for verification (used as fallback)
      userData: updatedUserData,
      message: emailSent.sent 
        ? 'Verification code sent to your email!' 
        : `Email sending failed: ${emailSent.error || 'Unknown error'}. Please check your email configuration.`,
      emailSent: emailSent.sent,
      emailError: emailSent.error || null
    })

  } catch (error) {
    console.error('Error sending verification code:', error)
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { verificationCode, userData } = body

    console.log('📥 Received verification request:', {
      hasVerificationCode: !!verificationCode,
      hasUserData: !!userData,
      userDataEmail: userData?.email,
      verificationCodeType: typeof verificationCode,
      verificationCodeValue: verificationCode
    })

    // Normalize email and code before verification
    const email = userData?.email?.toLowerCase().trim()
    const code = String(verificationCode || '').trim()

    console.log('🔐 Verification attempt:', { 
      originalEmail: userData?.email,
      normalizedEmail: email, 
      originalCode: verificationCode,
      normalizedCode: code,
      codeLength: code?.length,
      codePreview: code ? code.substring(0, 2) + '**' : 'empty',
      userDataVerificationCode: userData?.verificationCode,
      userDataKeys: userData ? Object.keys(userData) : []
    })

    if (!email || !code) {
      console.log('❌ Missing email or code:', { 
        email: email || 'MISSING', 
        code: code || 'MISSING',
        userDataEmail: userData?.email,
        verificationCode: verificationCode
      })
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      )
    }

    // Debug: Show all stored codes BEFORE verification
    const allCodesBefore = getAllStoredCodes()
    console.log('📋 All stored verification codes BEFORE verification:', allCodesBefore)
    console.log('🔍 Looking for email:', email)
    console.log('🔍 Looking for code:', code)
    console.log('🔍 UserData verificationCode (fallback):', userData?.verificationCode)
    
    // Try to verify from database first
    let isValid = verifyCode(email, code)
    console.log('🔍 Database verification result:', isValid)
    
    // Fallback: If database verification fails, check against the code stored in userData
    // This handles cases where database save failed but code was returned in response
    if (!isValid && userData?.verificationCode) {
      const storedCode = String(userData.verificationCode).trim()
      const enteredCode = String(code).trim()
      console.log('🔄 Trying fallback verification:', { 
        storedCode, 
        enteredCode, 
        match: storedCode === enteredCode,
        storedLength: storedCode.length,
        enteredLength: enteredCode.length
      })
      if (storedCode === enteredCode) {
        console.log('✅ Fallback verification successful!')
        isValid = true
      } else {
        console.log('❌ Fallback verification failed - codes do not match')
      }
    }
    
    console.log('🔍 Final verification result:', isValid)
    
    // Debug: Show all stored codes AFTER verification
    const allCodesAfter = getAllStoredCodes()
    console.log('📋 All stored verification codes AFTER verification:', allCodesAfter)
    
    if (!isValid) {
      console.log('❌ Verification failed for:', email)
      console.log('📋 Available emails in storage:', allCodesBefore.map(c => c.email))
      console.log('📋 Email comparison:', {
        lookingFor: email,
        available: allCodesBefore.map(c => ({
          email: c.email,
          matches: c.email === email,
          lowerMatches: c.email.toLowerCase() === email.toLowerCase()
        }))
      })
      
      // Provide more helpful error message
      const matchingEmail = allCodesBefore.find(c => c.email.toLowerCase() === email.toLowerCase())
      if (matchingEmail) {
        console.log('⚠️ Found matching email but code verification failed')
        return NextResponse.json(
          { error: `Invalid verification code. The code for ${email} is incorrect. Please check the code sent to your email and try again.` },
          { status: 400 }
        )
      } else {
        console.log('⚠️ No matching email found in storage')
        // Check if userData has verificationCode as last resort
        if (userData?.verificationCode) {
          console.log('⚠️ userData has verificationCode but it did not match')
        }
        return NextResponse.json(
          { error: 'No verification code found for this email. The code may have expired (5 minutes) or the server may have restarted. Please request a new verification code.' },
          { status: 400 }
        )
      }
    }

    // Create user in database
    // Declare user variable outside try block so it's accessible later
    let user: any = null
    try {
      // Ensure we have all required fields with proper fallbacks
      user = {
        id: userData.id,
        fullName: userData.fullName,
        username: userData.username,
        address: userData.address,
        department: userData.department,
        emergencyContactName: userData.emergencyContact?.name || userData.emergencyContactName || '',
        emergencyContactPhone: userData.emergencyContact?.phoneNumber || userData.emergencyContactPhone || '',
        email: email, // Use normalized email from verification
        password: userData.password,
        profilePhoto: userData.profilePhoto || null,
        phoneNumber: userData.phoneNumber || '', // Use phoneNumber from userData
        isPhoneVerified: 0, // Default to not verified
        isAdmin: 0, // Default to not admin
        institution: userData.institution || null,
        lecturerContactName: userData.lecturerContactName || null,
        lecturerContactPhone: userData.lecturerContactPhone || null
      }
      
      // Validate required fields before creating user
      if (!user.phoneNumber || user.phoneNumber.trim() === '') {
        console.error('❌ phoneNumber is required but missing:', user)
        return NextResponse.json(
          { error: 'Phone number is required' },
          { status: 400 }
        )
      }

      console.log('👤 Creating user in database:', { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        hasProfilePhoto: !!user.profilePhoto,
        hasEmergencyContact: !!user.emergencyContactName && !!user.emergencyContactPhone
      })

      const result = createUser(user)
      console.log('✅ User created successfully:', { 
        changes: result.changes,
        lastInsertRowid: result.lastInsertRowid 
      })
    } catch (createError: any) {
      console.error('❌ Error creating user:', createError)
      console.error('Error details:', {
        message: createError?.message,
        code: createError?.code,
        stack: createError?.stack
      })
      throw createError // Re-throw to be caught by outer catch
    }

    // Notify all admins about new intern
    if (user) {
      try {
        const admins = db.prepare('SELECT id FROM users WHERE isAdmin = 1').all() as any[]
        const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        admins.forEach((admin) => {
          db.prepare(`
            INSERT INTO notifications (id, userId, targetUserId, type, title, message)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(
            `${notificationId}-${admin.id}`,
            user.id,
            admin.id,
            'new_intern',
            'New Intern Joined',
            `${user.fullName} just signed up`
          )
        })
      } catch (error) {
        console.error('Error creating notification:', error)
        // Don't fail the signup if notification fails
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Account created successfully',
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName
      }
    })

  } catch (error: any) {
    console.error('❌ Verification error:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
      stack: error?.stack
    })
    return NextResponse.json(
      { 
        error: error?.message || 'Failed to verify and create account',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}
