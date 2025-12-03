"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { LogIn, User, Lock } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevent any form bubbling
    
    console.log('🚀 Login attempt started', formData)
    
    // Manual validation
    if (!formData.username || !formData.password) {
      toast.error('Please enter both username and password')
      return
    }
    
    if (formData.username.trim() === '') {
      toast.error('Username cannot be empty')
      return
    }
    
    if (formData.password.trim() === '') {
      toast.error('Password cannot be empty')
      return
    }
    
    // Prevent multiple submissions
    if (isLoading) {
      console.log('⚠️ Already submitting, ignoring')
      return
    }
    
    setIsLoading(true)
    try {
      console.log('📡 Calling API...', { username: formData.username })
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include', // Include cookies for Safari compatibility
        body: JSON.stringify(formData)
      })

      console.log('📥 Response received:', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      // Parse response (try to parse as JSON for both success and error)
      let result
      try {
        const responseText = await response.text()
        console.log('📦 Response text (first 200 chars):', responseText.substring(0, 200))
        
        if (!responseText) {
          throw new Error('Empty response')
        }
        
        // Check if response is HTML (error page)
        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
          console.error('💥 Received HTML error page instead of JSON')
          
          // Try to extract error message from HTML
          let errorMessage = 'Database is temporarily busy. Please close any database viewing tools and try again.'
          
          // Check for database locked error in the HTML
          if (responseText.includes('database is locked') || responseText.includes('SqliteError')) {
            errorMessage = 'Database is locked. Please close any database viewing tools (like DB Browser) and try again.'
          } else if (response.status === 401) {
            errorMessage = 'Incorrect username or password. Please check your credentials and try again.'
          } else if (response.status === 400) {
            errorMessage = 'Please enter both username and password.'
          } else if (response.status === 500) {
            errorMessage = 'Server error. Please try again in a moment.'
          }
          
          toast.error(errorMessage)
          setIsLoading(false)
          return
        }
        
        result = JSON.parse(responseText)
        console.log('📦 Parsed response:', result)
      } catch (parseError) {
        console.error('💥 Failed to parse response:', parseError)
        let errorMessage = 'Login failed. Please try again.'
        if (!response.ok) {
          if (response.status === 401) {
            errorMessage = 'Incorrect username or password. Please check your credentials and try again.'
          } else if (response.status === 400) {
            errorMessage = 'Please enter both username and password.'
          } else if (response.status === 500) {
            errorMessage = 'Database is locked. Please close any database viewing tools and try again.'
          } else {
            errorMessage = `Server error (${response.status}). Please try again.`
          }
        }
        toast.error(errorMessage)
        setIsLoading(false)
        return
      }

      // Check if response is ok
      if (!response.ok) {
        let errorMessage = 'Login failed. Please check your credentials and try again.'
        
        if (result && result.error) {
          errorMessage = result.error
        } else if (response.status === 401) {
          errorMessage = 'Incorrect username or password. Please check your credentials and try again.'
        } else if (response.status === 400) {
          errorMessage = 'Please enter both username and password.'
        }
        
        console.log('❌ API Error:', result, 'Status:', response.status)
        toast.error(errorMessage)
        setIsLoading(false)
        return
      }

      if (result.success && result.user) {
        console.log('✅ Login successful, storing auth...', result.user)
        console.log('🔍 Full result:', JSON.stringify(result, null, 2))
        
        try {
          // Store user data in localStorage for client-side auth
          // Store multiple times to ensure Safari saves it
          localStorage.setItem('isAuthenticated', 'true')
          localStorage.setItem('currentUserId', result.user.id)
          localStorage.setItem('currentUser', JSON.stringify(result.user))
          
          // Safari workaround: Also store in sessionStorage as backup
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('isAuthenticated', 'true')
            sessionStorage.setItem('currentUserId', result.user.id)
            sessionStorage.setItem('currentUser', JSON.stringify(result.user))
          }
          
          // Force a small delay to ensure Safari writes to localStorage
          await new Promise(resolve => setTimeout(resolve, 100))
          
          console.log('✅ localStorage updated successfully')
        } catch (storageError) {
          console.error('💥 Failed to save to localStorage:', storageError)
          // Even if localStorage fails, try to continue (Safari might allow it later)
        }
        
        console.log('🔄 Redirecting...')
        toast.success(`Welcome back, ${result.user.fullName}!`)
        
        // Redirect admins to admin panel, others to dashboard
        const isAdmin = result.user.isAdmin === 1 || 
                       result.user.isAdmin === true || 
                       result.user.isAdmin === '1' || 
                       result.user.isAdmin === 'true'
        const redirectPath = isAdmin ? "/admin" : "/dashboard"
        
        console.log('🔍 User isAdmin:', result.user.isAdmin, 'Type:', typeof result.user.isAdmin, 'Redirecting to:', redirectPath)
        
        // Try to save to localStorage (may fail in Safari, that's OK - URL params will work)
        try {
          localStorage.setItem('isAuthenticated', 'true')
          localStorage.setItem('currentUserId', result.user.id)
          localStorage.setItem('currentUser', JSON.stringify(result.user))
        } catch (e) {
          console.log('localStorage blocked (Safari) - will use URL params instead')
        }
        
        // Also try sessionStorage
        try {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('isAuthenticated', 'true')
            sessionStorage.setItem('currentUserId', result.user.id)
            sessionStorage.setItem('currentUser', JSON.stringify(result.user))
          }
        } catch (e) {}
        
        setIsLoading(false)
        
        console.log('🔄 Redirecting to:', redirectPath, 'User ID:', result.user.id, 'isAdmin:', result.user.isAdmin)
        
        // Use window.location for reliable redirect
        const fullUrl = `${window.location.origin}${redirectPath}?auth=true&userId=${result.user.id}`
        console.log('🔄 Full redirect URL:', fullUrl)
        console.log('🔄 Current location:', window.location.href)
        
        // Redirect immediately with error handling
        try {
          window.location.href = fullUrl
        } catch (redirectError) {
          console.error('❌ Redirect error:', redirectError)
          toast.error('Redirect failed. Please navigate manually to ' + redirectPath)
          // Fallback: try router
          router.push(redirectPath)
        }
      } else {
        console.log('❌ Login failed - invalid response:', result)
        let errorMessage = 'Login failed. Please check your username and password.'
        if (result && result.error) {
          errorMessage = result.error
        }
        toast.error(errorMessage)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('💥 Network error occurred:', error)
      let errorMessage = 'Network error. Please check your connection and try again.'
      if (error instanceof Error) {
        errorMessage = `Network error: ${error.message}`
      }
      toast.error(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-turquoise-50 to-turquoise-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <LogIn className="h-6 w-6 text-primary" />
            Intern Login
          </CardTitle>
          <CardDescription>
            Sign in to your intern account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form 
            onSubmit={onSubmit} 
            className="space-y-4"
            action="#" 
            method="post"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="username">
                <User className="inline h-4 w-4 mr-1" />
                Username
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Enter your username"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                <Lock className="inline h-4 w-4 mr-1" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              onClick={(e) => {
                // Ensure form submits
                if (!isLoading) {
                  const form = e.currentTarget.closest('form')
                  if (form) {
                    form.requestSubmit()
                  }
                }
              }}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center text-sm">
              Don't have an account?{" "}
              <a href="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
