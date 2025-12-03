"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DEPARTMENTS } from "@/lib/constants"
import { toast } from "sonner"
import { Phone, User, Home, Lock, Shield, CheckCircle } from "lucide-react"
import { CameraCapture } from "@/components/camera-capture"

export default function SignupPage() {
  const router = useRouter()
  const [verificationStep, setVerificationStep] = useState<"info" | "photo" | "verify">("info")
  const [verificationCode, setVerificationCode] = useState("")
  const [email, setEmail] = useState("")
  const [storedVerificationCode, setStoredVerificationCode] = useState("") // Internal storage, never displayed
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [canResend, setCanResend] = useState(true)
  const [accountCreated, setAccountCreated] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState<string>("")
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    address: '',
    department: '',
    phoneNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    email: '',
    password: '',
    confirmPassword: '',
    institution: '',
    lecturerContactName: '',
    lecturerContactPhone: ''
  })

  // Error state for each field
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Validation functions
  const validateField = (field: string, value: string): string => {
    // Shared regex patterns
    const phoneRegex = /^[0-9]{10,11}$/
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    switch (field) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required'
        return ''
      case 'username':
        if (!value.trim()) return 'Username is required'
        if (value.length < 3) return 'Username must be at least 3 characters'
        return ''
      case 'address':
        if (!value.trim()) return 'Address is required'
        return ''
      case 'department':
        if (!value) return 'Department is required'
        return ''
      case 'phoneNumber':
        if (!value.trim()) return 'Phone number is required'
        if (!phoneRegex.test(value.replace(/[\s-]/g, ''))) {
          return 'Phone number must be 10-11 digits'
        }
        return ''
      case 'emergencyContactName':
        if (!value.trim()) return 'Emergency contact name is required'
        return ''
      case 'emergencyContactPhone':
        if (!value.trim()) return 'Emergency contact phone is required'
        if (!phoneRegex.test(value.replace(/[\s-]/g, ''))) {
          return 'Phone number must be 10-11 digits'
        }
        return ''
      case 'email':
        if (!value.trim()) return 'Email is required'
        if (!emailRegex.test(value)) {
          return 'Please enter a valid email address (e.g., name@example.com)'
        }
        return ''
      case 'password':
        if (!value) return 'Password is required'
        if (value.length < 8) return 'Password must be at least 8 characters long'
        const hasLetter = /[a-zA-Z]/.test(value)
        const hasNumber = /[0-9]/.test(value)
        if (!hasLetter || !hasNumber) {
          return 'Password must include both alphabets and numbers'
        }
        return ''
      case 'confirmPassword':
        if (!value) return 'Please confirm your password'
        // Get current password value for comparison
        const currentPassword = formData.password
        if (currentPassword && value !== currentPassword) {
          return 'Passwords do not match'
        }
        return ''
      case 'institution':
        if (!value.trim()) return 'Institution is required'
        return ''
      case 'lecturerContactName':
        if (!value.trim()) return 'Lecturer contact name is required'
        return ''
      case 'lecturerContactPhone':
        if (!value.trim()) return 'Lecturer contact phone is required'
        if (!phoneRegex.test(value.replace(/[\s-]/g, ''))) {
          return 'Phone number must be 10-11 digits'
        }
        return ''
      default:
        return ''
    }
  }

  const handleBlur = (field: string) => {
    const value = formData[field as keyof typeof formData]
    const error = validateField(field, value)
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }))
    } else {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Check username availability (async)
  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) return
    
    try {
      const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`)
      const result = await response.json()
      
      if (!result.available) {
        setErrors(prev => ({ ...prev, username: 'Username existed. Choose other username' }))
      } else if (errors.username && errors.username.includes('Username existed')) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.username
          return newErrors
        })
      }
    } catch (error) {
      // Silently fail - we'll check on submit anyway
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('🚀 Signup attempt started', formData)
    console.log('📋 Form data check:', {
      fullName: !!formData.fullName,
      username: !!formData.username,
      address: !!formData.address,
      department: !!formData.department,
      emergencyContactName: !!formData.emergencyContactName,
      emergencyContactPhone: !!formData.emergencyContactPhone,
      email: !!formData.email,
      password: !!formData.password,
      confirmPassword: !!formData.confirmPassword
    })
    
    // Check if button is disabled
    if (loading) {
      console.log('⚠️ Button is disabled (loading state)')
      return
    }
    
    // Comprehensive validation - check all fields and show specific errors
    const newErrors: Record<string, string> = {}
    let hasErrors = false
    
    // Check required fields
    if (!formData.fullName?.trim()) {
      newErrors.fullName = 'Full name is required'
      hasErrors = true
    }
    
    if (!formData.username?.trim()) {
      newErrors.username = 'Username is required'
      hasErrors = true
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
      hasErrors = true
    }
    
    if (!formData.address?.trim()) {
      newErrors.address = 'Address is required'
      hasErrors = true
    }
    
    if (!formData.department) {
      newErrors.department = 'Department is required'
      hasErrors = true
    }
    
    if (!formData.phoneNumber?.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
      hasErrors = true
    } else {
      const phoneRegex = /^[0-9]{10,11}$/
      if (!phoneRegex.test(formData.phoneNumber.replace(/[\s-]/g, ''))) {
        newErrors.phoneNumber = 'Phone number must be 10-11 digits'
        hasErrors = true
      }
    }
    
    if (!formData.emergencyContactName?.trim()) {
      newErrors.emergencyContactName = 'Emergency contact name is required'
      hasErrors = true
    }
    
    if (!formData.emergencyContactPhone?.trim()) {
      newErrors.emergencyContactPhone = 'Emergency contact phone is required'
      hasErrors = true
    } else {
      const phoneRegex = /^[0-9]{10,11}$/
      if (!phoneRegex.test(formData.emergencyContactPhone.replace(/[\s-]/g, ''))) {
        newErrors.emergencyContactPhone = 'Phone number must be 10-11 digits'
        hasErrors = true
      }
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required'
      hasErrors = true
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address (e.g., name@example.com)'
        hasErrors = true
      }
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
      hasErrors = true
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long'
      hasErrors = true
    } else {
      const hasLetter = /[a-zA-Z]/.test(formData.password)
      const hasNumber = /[0-9]/.test(formData.password)
      if (!hasLetter || !hasNumber) {
        newErrors.password = 'Password must include both alphabets and numbers'
        hasErrors = true
      }
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
      hasErrors = true
    } else if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
      hasErrors = true
    }
    
    if (!formData.institution?.trim()) {
      newErrors.institution = 'Institution is required'
      hasErrors = true
    }
    
    if (!formData.lecturerContactName?.trim()) {
      newErrors.lecturerContactName = 'Lecturer contact name is required'
      hasErrors = true
    }
    
    if (!formData.lecturerContactPhone?.trim()) {
      newErrors.lecturerContactPhone = 'Lecturer contact phone is required'
      hasErrors = true
    } else {
      const phoneRegex = /^[0-9]{10,11}$/
      if (!phoneRegex.test(formData.lecturerContactPhone.replace(/[\s-]/g, ''))) {
        newErrors.lecturerContactPhone = 'Phone number must be 10-11 digits'
        hasErrors = true
      }
    }
    
    // Update errors state
    setErrors(newErrors)
    
    // If there are errors, show message and prevent proceeding
    if (hasErrors) {
      console.log('❌ Validation failed - errors:', newErrors)
      const missingFields = Object.keys(newErrors).filter(key => newErrors[key].includes('required'))
      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields. ${missingFields.length} field(s) missing.`)
      } else {
        toast.error('Please fix the errors in the form before proceeding.')
      }
      // Scroll to first error field
      const firstErrorField = Object.keys(newErrors)[0]
      const errorElement = document.getElementById(firstErrorField)
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        errorElement.focus()
      }
      return
    }
    
    console.log('✅ Validation passed, calling API...')
    setLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      console.log('📡 API Response status:', response.status)
      const result = await response.json()
      console.log('📦 Signup response:', result)

      if (!response.ok) {
        // Handle API errors with specific messages
        let errorMessage = result.error || result.message || 'Failed to process signup. Please try again.'
        
        // Check for username already exists error
        if (result.error && (result.error.includes('Username already') || result.error.includes('username'))) {
          errorMessage = 'Username existed. Choose other username'
        }
        
        console.log('❌ API Error:', errorMessage)
        toast.error(errorMessage)
        setLoading(false)
        return
      }

      if (response.ok) {
        console.log('✅ API call successful, setting up verification...')
        // Store user data from API response
        if (result.userData) {
          setUserData(result.userData)
        } else {
          // Fallback to creating userData from form (backward compatibility)
          setUserData({
            id: result.userId || Date.now().toString(),
            fullName: formData.fullName,
            username: formData.username,
            address: formData.address,
            department: formData.department,
            emergencyContact: {
              name: formData.emergencyContactName,
              phoneNumber: formData.emergencyContactPhone
            },
            email: formData.email,
            password: formData.password,
            phoneNumber: formData.phoneNumber,
            institution: formData.institution,
            lecturerContactName: formData.lecturerContactName,
            lecturerContactPhone: formData.lecturerContactPhone
          })
        }

        // Log verification code to console for debugging (always)
        if (result.verificationCode) {
          console.log('🔑 Verification Code:', result.verificationCode)
          console.log('📧 Email sent status:', result.emailSent)
          if (result.emailError) {
            console.error('📧 Email error:', result.emailError)
          }
          setStoredVerificationCode(result.verificationCode)
        }
        
        // NEVER display code on screen - it should only come via email
        if (result.emailSent) {
          toast.success('Verification code sent to your email!')
        } else {
          // Email failed - show error and code in console
          const errorMsg = result.emailError || 'Email sending failed'
          console.log('📧 EMAIL NOT SENT')
          console.log('📧 Error:', errorMsg)
          console.log('📧 Verification Code (use this):', result.verificationCode)
          
          toast.error(`Email not sent: ${errorMsg}. Code in console (F12)`, {
            duration: 10000,
            description: `Your code: ${result.verificationCode}`,
          })
          
          // Store code for testing
          if (result.verificationCode) {
            setStoredVerificationCode(result.verificationCode)
          }
        }
        
        setEmail(formData.email)
        setCanResend(false)
        setCountdown(60) // 1 minute countdown before resend is allowed
        
        // Go to photo step first (REQUIRED)
        console.log('🔄 Switching to photo step...')
        console.log('📊 Current state:', { 
          verificationStep, 
          hasUserData: !!userData,
          verificationCode: result.verificationCode 
        })
        setVerificationStep("photo")
        console.log('✅ Photo step should be active now')
      } else {
        console.log('❌ API call failed:', result.error, result)
        let errorMessage = result.error || 'Failed to start signup process'
        
        // Check for username already exists error
        if (result.error && (result.error.includes('Username already') || result.error.includes('username'))) {
          errorMessage = 'Username existed. Choose other username'
        }
        
        toast.error(errorMessage)
      }
    } catch (error) {
      console.log('💥 Error occurred:', error)
      toast.error('Failed to start signup process')
      console.error(error)
    } finally {
      console.log('🏁 Setting loading to false')
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!userData) {
      toast.error('Please complete the signup form first')
      setVerificationStep("info")
      return
    }
    
    // Photo is REQUIRED for face recognition
    if (!profilePhoto) {
      toast.error('Please capture your profile photo first')
      setVerificationStep("photo")
      return
    }
    
    setLoading(true)
    try {
      console.log('📤 Sending verification request:', {
        verificationCode,
        codeLength: verificationCode?.length,
        userDataEmail: userData?.email,
        userDataVerificationCode: userData?.verificationCode,
        hasProfilePhoto: !!profilePhoto,
        userDataKeys: userData ? Object.keys(userData) : []
      })

      const response = await fetch('/api/auth/signup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationCode: String(verificationCode || '').trim(),
          userData: {
            ...userData,
            email: userData?.email?.toLowerCase().trim(), // Normalize email before sending
            profilePhoto,
            verificationCode: userData?.verificationCode // Ensure verificationCode is included
          }
        })
      })

      const result = await response.json()
      console.log('📥 Verification response:', { 
        ok: response.ok, 
        status: response.status,
        result 
      })

      if (response.ok) {
        toast.success("✅ Account created successfully! Redirecting to login...", {
          duration: 3000,
        })
        setAccountCreated(true)
        // Show success message and redirect to login page after a delay
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        console.error('❌ Verification failed:', {
          status: response.status,
          error: result.error,
          fullResult: result
        })
        // Show more detailed error message
        const errorMsg = result.error || 'Invalid verification code. Please check the code and try again.'
        toast.error(errorMsg, {
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('❌ Verification request error:', error)
      toast.error('Failed to verify code')
    } finally {
      setLoading(false)
    }
  }

  // Countdown timer for resend code
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && !canResend) {
      setCanResend(true)
    }
  }, [countdown, canResend])

  // Function to resend code
  const handleResendCode = async () => {
    if (!canResend || !userData) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: userData.fullName,
          username: userData.username,
          address: userData.address,
          department: userData.department,
          emergencyContactName: userData.emergencyContact.name,
          emergencyContactPhone: userData.emergencyContact.phoneNumber,
          email: userData.email,
          password: userData.password,
          institution: userData.institution,
          lecturerContactName: userData.lecturerContactName,
          lecturerContactPhone: userData.lecturerContactPhone
        })
      })

      const result = await response.json()
      
      if (response.ok && result.verificationCode) {
        console.log('📧 New verification code generated:', result.verificationCode)
        if (result.emailSent) {
          toast.success('New code sent to your email!')
        } else {
          toast.info('Check console for code (Email not configured)')
        }
        setStoredVerificationCode(result.verificationCode)
        setCanResend(false)
        setCountdown(60) // 1 minute countdown before resend is allowed
      }
    } catch (error) {
      console.error('Failed to resend code:', error)
    } finally {
      setLoading(false)
    }
  }

  if (accountCreated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-turquoise-50 to-turquoise-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              Account Created Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="py-8">
              <p className="text-lg font-medium mb-2">✅ Your account has been created!</p>
              <p className="text-muted-foreground">You will be redirected to login shortly...</p>
            </div>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (verificationStep === "photo") {
    console.log('📸 Rendering photo step...', { hasUserData: !!userData })
    
    if (!userData) {
      // If userData is not set, go back to info step
      console.error('⚠️ userData not set, returning to info step')
      setVerificationStep("info")
      toast.error('Please fill in all fields first')
      return null
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-turquoise-50 to-turquoise-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📸 Capture Your Profile Photo
            </CardTitle>
            <CardDescription>
              Take a photo of yourself for face recognition during clock in/out
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CameraCapture
              title="Capture Your Profile Photo"
              onCapture={async (photo) => {
                console.log('📸 Photo confirmed by user, sending verification code to email...')
                setProfilePhoto(photo)
                
                // Immediately proceed to verification step (don't wait for email)
                setVerificationStep("verify")
                
                // Send verification code in background (non-blocking)
                setLoading(true)
                try {
                  const response = await fetch('/api/auth/signup', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userData })
                  })

                  const result = await response.json()

                  if (response.ok && result.verificationCode) {
                    // Update userData with verification code
                    setUserData({
                      ...userData,
                      verificationCode: result.verificationCode
                    })
                    setStoredVerificationCode(result.verificationCode)
                    
                    if (result.emailSent) {
                      toast.success('Verification code sent to your email! Please check your inbox.')
                    } else {
                      // Email failed - show error but still allow verification (code is in userData)
                      toast.error(`Email sending failed: ${result.emailError || 'Email service not configured'}. Code verification will use fallback method.`, {
                        duration: 8000,
                      })
                      console.error('📧 Email sending failed. Using fallback verification.')
                    }
                    
                    setEmail(userData.email)
                    setCanResend(false)
                    setCountdown(60) // 1 minute countdown before resend is allowed
                  } else {
                    toast.error(result.error || 'Failed to send verification code')
                    console.error('❌ Failed to send verification code:', result)
                  }
                } catch (error) {
                  console.error('❌ Error sending verification code:', error)
                  toast.error('Failed to send verification code. Please try again.')
                } finally {
                  setLoading(false)
                }
              }}
              onClose={() => {
                console.log('🔙 Closing camera, returning to info')
                setVerificationStep("info")
              }}
            />
            <p className="text-sm text-muted-foreground text-center mt-4">
              ⚠️ Photo is required for face recognition during attendance
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (verificationStep === "verify") {
    console.log('✅ Rendering verification step', { userData: !!userData, verificationCode })
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-turquoise-50 to-turquoise-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Email Verification
            </CardTitle>
            <CardDescription>
              Enter the verification code sent to your email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Enter Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="0000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={4}
                className="text-center text-2xl tracking-widest"
              />
            </div>
            <Button onClick={handleVerify} className="w-full" disabled={verificationCode.length !== 4 || loading}>
              {loading ? "Verifying..." : "Verify & Create Account"}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-2">Didn't receive a code?</p>
              <Button
                variant="link"
                onClick={handleResendCode}
                disabled={!canResend || loading}
                className="text-primary hover:text-primary/80 disabled:opacity-50"
              >
                {canResend ? 'Resend Code' : `Resend in ${countdown}s`}
              </Button>
            </div>
            
            <Button
              variant="outline"
              onClick={() => {
                setVerificationStep("info")
                setVerificationCode("")
                setFormData({
                  fullName: '',
                  username: '',
                  address: '',
                  department: '',
                  emergencyContactName: '',
                  emergencyContactPhone: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  institution: '',
                  lecturerContactName: '',
                  lecturerContactPhone: ''
                })
              }}
              className="w-full"
            >
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-turquoise-50 to-turquoise-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <User className="h-6 w-6 text-primary" />
            Intern Sign Up
          </CardTitle>
          <CardDescription>
            Create your intern account. All fields are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  <User className="inline h-4 w-4 mr-1" />
                  Full Name *
                </Label>
                <Input 
                  id="fullName" 
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Ahmad bin Abdullah" 
                  autoComplete="name" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input 
                  id="username" 
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="ahmad123" 
                  autoComplete="username" 
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">
                  <Home className="inline h-4 w-4 mr-1" />
                  Address *
                </Label>
                <Input 
                  id="address" 
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Jalan Merdeka, Kuala Lumpur" 
                  autoComplete="street-address" 
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="department">Department *</Label>
                <select
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  onBlur={() => handleBlur('department')}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${errors.department ? 'border-red-500' : ''}`}
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && (
                  <p className="text-sm text-red-500">{errors.department}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Emergency Contact Name *</Label>
                <Input 
                  id="emergencyContactName" 
                  value={formData.emergencyContactName}
                  onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                  onBlur={() => handleBlur('emergencyContactName')}
                  placeholder="Parent/Guardian Name"
                  className={errors.emergencyContactName ? 'border-red-500' : ''}
                />
                {errors.emergencyContactName && (
                  <p className="text-sm text-red-500">{errors.emergencyContactName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Emergency Contact Phone *</Label>
                <Input 
                  id="emergencyContactPhone" 
                  value={formData.emergencyContactPhone}
                  onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                  onBlur={() => handleBlur('emergencyContactPhone')}
                  placeholder="0123456789"
                  className={errors.emergencyContactPhone ? 'border-red-500' : ''}
                />
                {errors.emergencyContactPhone && (
                  <p className="text-sm text-red-500">{errors.emergencyContactPhone}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="institution">Institution / University *</Label>
                <Input 
                  id="institution" 
                  value={formData.institution}
                  onChange={(e) => handleInputChange('institution', e.target.value)}
                  onBlur={() => handleBlur('institution')}
                  placeholder="Universiti Teknologi Malaysia"
                  className={errors.institution ? 'border-red-500' : ''}
                />
                {errors.institution && (
                  <p className="text-sm text-red-500">{errors.institution}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lecturerContactName">Lecturer Contact Name *</Label>
                <Input 
                  id="lecturerContactName" 
                  value={formData.lecturerContactName}
                  onChange={(e) => handleInputChange('lecturerContactName', e.target.value)}
                  onBlur={() => handleBlur('lecturerContactName')}
                  placeholder="Dr. Ahmad bin Abdullah"
                  className={errors.lecturerContactName ? 'border-red-500' : ''}
                />
                {errors.lecturerContactName && (
                  <p className="text-sm text-red-500">{errors.lecturerContactName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lecturerContactPhone">Lecturer Contact Phone *</Label>
                <Input 
                  id="lecturerContactPhone" 
                  value={formData.lecturerContactPhone}
                  onChange={(e) => handleInputChange('lecturerContactPhone', e.target.value)}
                  onBlur={() => handleBlur('lecturerContactPhone')}
                  placeholder="0123456789"
                  className={errors.lecturerContactPhone ? 'border-red-500' : ''}
                />
                {errors.lecturerContactPhone && (
                  <p className="text-sm text-red-500">{errors.lecturerContactPhone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Phone Number *
                </Label>
                <Input 
                  id="phoneNumber" 
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  onBlur={() => handleBlur('phoneNumber')}
                  placeholder="0123456789"
                  autoComplete="tel"
                  className={errors.phoneNumber ? 'border-red-500' : ''}
                  required
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-500">{errors.phoneNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  <User className="inline h-4 w-4 mr-1" />
                  Your Email Address *
                </Label>
                <Input 
                  id="email" 
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="your@email.com" 
                  autoComplete="email"
                  className={errors.email ? 'border-red-500' : ''}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  <Lock className="inline h-4 w-4 mr-1" />
                  Password *
                </Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••" 
                  autoComplete="new-password"
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password ? (
                  <p className="text-sm text-red-500">{errors.password}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters with both letters and numbers
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="••••••" 
                  autoComplete="new-password"
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              onClick={(e) => {
                console.log('🖱️ Button clicked!', { loading, formData })
                // Let form onSubmit handle it
              }}
            >
              {loading ? "Processing..." : "Continue to Verification"}
            </Button>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <a href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
