/**
 * Navigation guard utility to prevent direct URL access
 * Allows page refreshes but redirects direct URL copy-paste
 */

export function checkDirectAccess(): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    // Check if sessionStorage is available
    if (typeof sessionStorage === 'undefined') {
      return false // If sessionStorage not available, allow access
    }
    
    // Check if this is a legitimate navigation (marked in sessionStorage)
    const legitimateNav = sessionStorage.getItem('legitimateNavigation') === 'true'
    
    // Check referrer
    const referrer = document.referrer
    const currentOrigin = window.location.origin
    
    // If legitimate navigation flag exists, allow access
    if (legitimateNav) {
      // Clear the flag after use
      sessionStorage.removeItem('legitimateNavigation')
      return false // Not direct access
    }
    
    // If referrer is from same origin, it's likely a refresh or internal navigation
    if (referrer && referrer.startsWith(currentOrigin)) {
      return false // Not direct access
    }
    
    // If referrer is empty or from different origin, it's likely direct access
    // But we need to distinguish from refresh
    // Check if this is a refresh using performance API (with error handling)
    try {
      if (typeof performance !== 'undefined' && performance.getEntriesByType) {
        const navEntries = performance.getEntriesByType('navigation')
        if (navEntries && navEntries.length > 0) {
          const navEntry = navEntries[0] as any
          // If navigation type is reload, it's a refresh - allow it
          if (navEntry.type === 'reload') {
            return false // Not direct access (it's a refresh)
          }
        }
      }
    } catch (e) {
      // Performance API not available or error - continue with other checks
      console.warn('Performance API check failed:', e)
    }
    
    // No referrer and not a refresh = likely direct access
    if (!referrer || !referrer.startsWith(currentOrigin)) {
      return true // Direct access detected
    }
    
    return false
  } catch (error) {
    // If any error occurs, allow access to prevent blocking legitimate users
    console.error('Error in checkDirectAccess:', error)
    return false
  }
}

/**
 * Mark navigation as legitimate (call this when navigating via internal links)
 */
export function markLegitimateNavigation() {
  try {
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('legitimateNavigation', 'true')
    }
  } catch (error) {
    // Silently fail if sessionStorage is not available
    console.warn('Failed to mark legitimate navigation:', error)
  }
}

