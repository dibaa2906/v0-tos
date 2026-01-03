/**
 * Navigation guard utilities
 * Prevents direct access to protected pages
 */

export function checkDirectAccess(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  
  // If not authenticated, it's direct access
  if (!isAuthenticated) {
    return true
  }
  
  // Check if there's a legitimate navigation flag
  // This would be set by the router when navigating from login
  const legitimateNavigation = sessionStorage.getItem('legitimateNavigation')
  
  // If no legitimate navigation flag and user is authenticated,
  // it might still be direct access (refresh, bookmark, etc.)
  // But we allow it if authenticated
  return false
}

export function markLegitimateNavigation(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('legitimateNavigation', 'true')
  }
}

export function clearLegitimateNavigation(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('legitimateNavigation')
  }
}

