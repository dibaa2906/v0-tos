"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
// Removed isAuthenticated import - will check auth client-side via localStorage
import { Loader2 } from "lucide-react"
import { checkDirectAccess } from "@/lib/navigation-guard"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout | null = null
    let redirectTimer: NodeJS.Timeout | null = null
    
    // FIRST: Check URL parameters immediately (highest priority - login redirects)
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
    
    // SECOND: Check for logout flag - prevent forward navigation after logout
    try {
      if (typeof sessionStorage !== 'undefined') {
        const logoutFlag = sessionStorage.getItem('logoutFlag')
        if (logoutFlag === 'true') {
          console.log('[AuthGuard] Logout flag detected, redirecting to login')
          sessionStorage.removeItem('logoutFlag')
          router.replace('/login')
          return () => {
            mounted = false
            if (timeoutId) clearTimeout(timeoutId)
            if (redirectTimer) clearTimeout(redirectTimer)
          }
        }
      }
    } catch (error) {
      console.error('[AuthGuard] Error checking logout flag:', error)
    }

    // THIRD: Check for direct access (copy-paste URL) - redirect to login
    try {
      if (checkDirectAccess()) {
        console.log('[AuthGuard] Direct access detected, redirecting to login')
        router.replace('/login')
        return () => {
          mounted = false
          if (timeoutId) clearTimeout(timeoutId)
          if (redirectTimer) clearTimeout(redirectTimer)
        }
      }
    } catch (error) {
      console.error('[AuthGuard] Error checking direct access:', error)
      // Continue with normal auth flow if check fails
    }
    
    // FOURTH: Check storage-based auth (only if no URL params)
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

    // If no auth found, redirect to login immediately
    // (Small delay for Safari localStorage timing, but much shorter)
    timeoutId = setTimeout(() => {
      if (!mounted) return
      
      if (!checkStorageAuth()) {
        // Still no auth - redirect to login
        console.log('[AuthGuard] No auth found, redirecting to login')
        setIsAuthed(false)
        setIsLoading(false)
        redirectTimer = setTimeout(() => {
          router.replace("/login")
        }, 100)
      }
    }, 300) // Reduced from 1500ms to 300ms for faster redirect

    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
      if (redirectTimer) clearTimeout(redirectTimer)
    }
  }, [router])

  if (!isAuthed) {
    // Return null to allow immediate redirect without showing loading state
    console.log('[AuthGuard] Not authenticated, redirecting to login')
    return null
  }

  console.log('[AuthGuard] User authenticated, rendering children')
  return <>{children}</>
}

// AdminGuard: Ensures isAuthenticated AND currentUser.isAdmin (uses localStorage and DB)
// Removed getCurrentUser import - will get user from localStorage/sessionStorage
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check for logout flag - prevent forward navigation after logout
    try {
      if (typeof sessionStorage !== 'undefined') {
        const logoutFlag = sessionStorage.getItem('logoutFlag')
        if (logoutFlag === 'true') {
          console.log('[AdminGuard] Logout flag detected, redirecting to login')
          sessionStorage.removeItem('logoutFlag')
          router.replace('/login')
          return
        }
      }
    } catch (error) {
      console.error('[AdminGuard] Error checking logout flag:', error)
    }

    // Check for direct access (copy-paste URL) - redirect to homepage
    try {
      if (checkDirectAccess()) {
        console.log('[AdminGuard] Direct access detected, redirecting to login')
        router.replace('/login')
        return
      }
    } catch (error) {
      console.error('[AdminGuard] Error checking direct access:', error)
      // Continue with normal auth flow if check fails
    }

    async function check() {
      // Check authentication client-side (avoid importing server-side code)
      let authenticated = false
      try {
        if (typeof window !== 'undefined') {
          authenticated = sessionStorage.getItem("isAuthenticated") === "true" || 
                          localStorage.getItem("isAuthenticated") === "true" ||
                          !!sessionStorage.getItem("currentUserId") ||
                          !!localStorage.getItem("currentUserId") ||
                          !!sessionStorage.getItem("currentUser") ||
                          !!localStorage.getItem("currentUser")
        }
      } catch (error) {
        console.warn('Storage check error:', error)
      }
      
      setIsAuthed(authenticated)
      if (!authenticated) {
        router.replace('/login')
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
      
      // Fallback to API fetch (doesn't require importing database code)
      try {
        const userId = sessionStorage.getItem('currentUserId') || localStorage.getItem('currentUserId')
        if (userId) {
          const response = await fetch(`/api/auth/me?userId=${userId}`)
          const data = await response.json()
          if (data.success && data.user) {
            const user = data.user
            console.log('[AdminGuard] Fetched user from API:', user?.isAdmin, 'Type:', typeof user?.isAdmin)
            try {
              localStorage.setItem('currentUser', JSON.stringify(user))
              if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem('currentUser', JSON.stringify(user))
                if (user.id) {
                  sessionStorage.setItem('currentUserId', user.id)
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
              console.log('[AdminGuard] User is not admin, redirecting to login. isAdmin value:', user?.isAdmin, 'Type:', typeof user?.isAdmin)
              router.replace('/login')
              setIsLoading(false)
              return
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        router.replace('/login')
        setIsLoading(false)
        return
      }
      setIsLoading(false)
    }
    check()
  }, [router])

  // If not authenticated, redirect to login immediately (no loading state)
  if (!isAuthed) {
    return null // Component will redirect in useEffect
  }
  
  // If authenticated but not admin, redirect to login
  if (!isAdmin) {
    return null // Component will redirect in useEffect
  }
  
  // Show loading only while checking admin status
  if (isLoading) {
    return null // Don't show loading, let redirect happen
  }
  return <>{children}</>
}
