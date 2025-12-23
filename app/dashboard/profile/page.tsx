"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProfileEditor } from "@/components/profile-editor"
import { checkDirectAccess } from "@/lib/navigation-guard"

export default function ProfilePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if this is a legitimate login redirect (has auth params)
    const urlParams = new URLSearchParams(window.location.search)
    const isLoginRedirect = urlParams.get('auth') === 'true' && urlParams.get('userId')
    
    // Only check for direct access if this is NOT a login redirect
    if (!isLoginRedirect) {
      try {
        if (checkDirectAccess()) {
          console.log('[ProfilePage] Direct access detected, redirecting to login')
          router.replace('/login')
          return
        }
      } catch (error) {
        console.error('[ProfilePage] Error checking direct access:', error)
      }
    }

    // Check for logout flag - prevent forward navigation after logout
    try {
      if (typeof sessionStorage !== 'undefined') {
        const logoutFlag = sessionStorage.getItem('logoutFlag')
        if (logoutFlag === 'true') {
          sessionStorage.removeItem('logoutFlag')
          router.replace('/login')
          return
        }
      }
    } catch (error) {
      // Ignore errors
    }

    // Replace history to prevent forward navigation
    window.history.replaceState(null, '', window.location.href)
  }, [router])

  return <ProfileEditor />
}

