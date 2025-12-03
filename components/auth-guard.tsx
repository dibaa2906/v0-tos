"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout | null = null
    let redirectTimer: NodeJS.Timeout | null = null
    
    // FIRST: Check URL parameters immediately (highest priority for Safari)
    const urlParams = new URLSearchParams(window.location.search)
    const urlAuth = urlParams.get('auth') === 'true'
    const urlUserId = urlParams.get('userId')
    
    if (urlAuth && urlUserId) {
      console.log('[AuthGuard] URL auth params detected - allowing access immediately')
      
      // Immediately allow access (don't wait for anything)
      if (mounted) {
        setIsAuthed(true)
        setIsLoading(false)
      }
      
      // Save to storage in background (non-blocking)
      try {
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('currentUserId', urlUserId)
      } catch (e) {}
      
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('isAuthenticated', 'true')
          sessionStorage.setItem('currentUserId', urlUserId)
        }
      } catch (e) {}
      
      // Fetch and save user data in background
      fetch(`/api/auth/me?userId=${urlUserId}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.user && mounted) {
            try {
              localStorage.setItem('currentUser', JSON.stringify(data.user))
            } catch (e) {}
            try {
              if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem('currentUser', JSON.stringify(data.user))
              }
            } catch (e) {}
          }
        })
        .catch(() => {})
      
      // Clean URL after a moment (non-blocking)
      setTimeout(() => {
        if (mounted) {
          window.history.replaceState({}, '', window.location.pathname)
        }
      }, 500)
      
      return () => {
        mounted = false
        if (timeoutId) clearTimeout(timeoutId)
        if (redirectTimer) clearTimeout(redirectTimer)
      }
    }
    
    // SECOND: Check storage-based auth (only if no URL params)
    const checkStorageAuth = () => {
      try {
        if (typeof sessionStorage !== 'undefined') {
          const sessionAuth = sessionStorage.getItem('isAuthenticated') === 'true'
          const sessionUserId = sessionStorage.getItem('currentUserId')
          const sessionUser = sessionStorage.getItem('currentUser')
          if (sessionAuth || sessionUserId || sessionUser) {
            if (mounted) {
              setIsAuthed(true)
              setIsLoading(false)
            }
            return true
          }
        }
      } catch (error) {
        console.warn('Session storage unavailable:', error)
      }
      
      const isAuthFlag = localStorage.getItem('isAuthenticated') === 'true'
      const userId = localStorage.getItem('currentUserId')
      const user = localStorage.getItem('currentUser')
      
      if (isAuthFlag || userId || user) {
        if (mounted) {
          setIsAuthed(true)
          setIsLoading(false)
        }
        return true
      }
      return false
    }

    // Check immediately
    if (checkStorageAuth()) {
      return () => {
        mounted = false
        if (timeoutId) clearTimeout(timeoutId)
        if (redirectTimer) clearTimeout(redirectTimer)
      }
    }

    // If no auth found, wait a bit then check again (Safari timing)
    timeoutId = setTimeout(() => {
      if (!mounted) return
      
      if (!checkStorageAuth()) {
        // Still no auth - redirect to login
        console.log('[AuthGuard] No auth found after timeout, redirecting to login')
        setIsAuthed(false)
        setIsLoading(false)
        redirectTimer = setTimeout(() => {
          router.push("/login")
        }, 100)
      }
    }, 1500)

    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
      if (redirectTimer) clearTimeout(redirectTimer)
    }
  }, [router])

  if (!isAuthed) {
    // Show loading state while redirecting
    console.log('[AuthGuard] Rendering not authenticated state', { isLoading, isAuthed })
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">
            {isLoading ? 'Loading...' : 'Redirecting to login...'}
          </span>
        </div>
      </div>
    )
  }

  console.log('[AuthGuard] User authenticated, rendering children')
  return <>{children}</>
}

// AdminGuard: Ensures isAuthenticated AND currentUser.isAdmin (uses localStorage and DB)
import { getCurrentUser } from '@/lib/auth'
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function check() {
      const authenticated = isAuthenticated()
      setIsAuthed(authenticated)
      if (!authenticated) {
        router.push('/')
        setIsLoading(false)
        return
      }
      
      // First check localStorage for immediate check
      let storedUserStr: string | null = null
      try {
        if (typeof sessionStorage !== 'undefined') {
          storedUserStr = sessionStorage.getItem('currentUser')
        }
      } catch (error) {
        console.warn('Session storage unavailable:', error)
      }
      if (!storedUserStr) {
        storedUserStr = localStorage.getItem('currentUser')
      }
      if (storedUserStr) {
        try {
          const storedUser = JSON.parse(storedUserStr)
          console.log('[AdminGuard] Checking localStorage user:', storedUser.isAdmin, 'Type:', typeof storedUser.isAdmin)
          // Check multiple formats: 1, true, '1', 'true'
          const userIsAdmin = storedUser.isAdmin === 1 || 
                              storedUser.isAdmin === true || 
                              String(storedUser.isAdmin) === '1' || 
                              String(storedUser.isAdmin) === 'true'
          console.log('[AdminGuard] User isAdmin check result:', userIsAdmin)
          if (userIsAdmin) {
            setIsAdmin(true)
            setIsLoading(false)
            return
          }
        } catch (e) {
          console.error('Error parsing stored user:', e)
        }
      }
      
      // Fallback to API fetch
      const user = await getCurrentUser()
        console.log('[AdminGuard] Fetched user from API:', user?.isAdmin, 'Type:', typeof user?.isAdmin)
        try {
          if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user))
            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.setItem('currentUser', JSON.stringify(user))
              if (user.id) {
                sessionStorage.setItem('currentUserId', user.id)
              }
            }
          }
        } catch (error) {
          console.warn('Failed to cache fetched admin user:', error)
        }
      // Check if user is admin (handle both integer, boolean, and string values)
      const userIsAdmin = user?.isAdmin === 1 || 
                          user?.isAdmin === true || 
                          String(user?.isAdmin) === '1' || 
                          String(user?.isAdmin) === 'true'
      console.log('[AdminGuard] User isAdmin check result from API:', userIsAdmin)
      if (userIsAdmin) {
        setIsAdmin(true)
      } else {
        console.log('[AdminGuard] User is not admin, redirecting to dashboard. isAdmin value:', user?.isAdmin, 'Type:', typeof user?.isAdmin)
        router.push('/dashboard')
        setIsLoading(false)
        return
      }
      setIsLoading(false)
    }
    check()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-muted-foreground ml-2">Loading admin...</span>
      </div>
    )
  }
  if (!isAuthed || !isAdmin) return null
  return <>{children}</>
}
