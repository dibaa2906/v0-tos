// Authentication utilities for intern attendance system
export interface EmergencyContact {
  name: string
  phoneNumber: string
}

export interface InternUser {
  id: string
  fullName: string
  username: string
  email: string
  address: string
  department: string
  emergencyContact: EmergencyContact
  isPhoneVerified: boolean
  password?: string
  profilePhoto?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  isAdmin?: boolean | number
  isActive?: boolean | number
  // phoneNumber removed, email is the standard now
}

// Re-export DEPARTMENTS from constants to avoid bundling database code in client components
export { DEPARTMENTS, type Department } from './constants'

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  
  // Prefer sessionStorage (tab-scoped) so each tab keeps its own session even if another tab logs in as someone else
  try {
    if (typeof sessionStorage !== "undefined") {
      const sessionAuth = sessionStorage.getItem("isAuthenticated") === "true"
      const sessionUserId = !!sessionStorage.getItem("currentUserId")
      const sessionUser = !!sessionStorage.getItem("currentUser")
      if (sessionAuth || sessionUserId || sessionUser) {
        return true
      }
    }
  } catch (error) {
    console.warn('Session storage unavailable:', error)
  }
  
  // Fallback to localStorage (shared across tabs)
  const isAuthFlag = localStorage.getItem("isAuthenticated") === "true"
  const hasUserId = !!localStorage.getItem("currentUserId")
  const hasUser = !!localStorage.getItem("currentUser")
  
  return isAuthFlag || hasUserId || hasUser
}

export async function getCurrentUser(): Promise<InternUser | null> {
  if (typeof window === "undefined") return null
  
  // First try tab-scoped sessionStorage (keeps per-tab identities)
  try {
    if (typeof sessionStorage !== "undefined") {
      const sessionUser = sessionStorage.getItem('currentUser')
      if (sessionUser) {
        return JSON.parse(sessionUser)
      }
    }
  } catch (error) {
    console.warn('Session storage unavailable:', error)
  }
  
  // First try to get from localStorage (set during login)
  const storedUser = localStorage.getItem('currentUser')
  if (storedUser) {
    try {
      return JSON.parse(storedUser)
    } catch {
      // Invalid JSON, continue to fetch
    }
  }
  
  let userId: string | null = null
  try {
    if (typeof sessionStorage !== 'undefined') {
      userId = sessionStorage.getItem("currentUserId")
    }
  } catch (error) {
    console.warn('Session storage unavailable:', error)
  }
  if (!userId) {
    userId = localStorage.getItem("currentUserId")
  }
  if (!userId) return null
  
  // Fetch actual user from database via API (query param optional, cookie fallback)
  try {
    const endpoint = userId ? `/api/auth/me?userId=${encodeURIComponent(userId)}` : '/api/auth/me'
    const response = await fetch(endpoint, {
      method: 'GET'
    })

    if (response.ok) {
      const result = await response.json()
      if (result.success && result.user) {
        // Store in localStorage for future use
        localStorage.setItem('currentUser', JSON.stringify(result.user))
        try {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('currentUser', JSON.stringify(result.user))
            if (userId) {
              sessionStorage.setItem('currentUserId', userId)
            }
          }
        } catch (error) {
          console.warn('Failed to persist user in sessionStorage:', error)
        }
        return result.user
      }
    }
    
    console.log('❌ Failed to fetch user from database')
    return null
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export function getUsers(): InternUser[] {
  if (typeof window === "undefined") return []
  const usersJson = localStorage.getItem("users")
  return usersJson ? JSON.parse(usersJson) : []
}

export function saveUser(user: InternUser): void {
  if (typeof window === "undefined") return
  const users = getUsers()
  const existingIndex = users.findIndex(u => u.id === user.id || u.username === user.username)
  
  if (existingIndex >= 0) {
    users[existingIndex] = user
  } else {
    users.push(user)
  }
  
  localStorage.setItem("users", JSON.stringify(users))
}

export function login(username: string, password: string): InternUser | null {
  if (typeof window === "undefined") return null
  const users = getUsers()
  const user = users.find(u => u.username === username && u.password === password)
  
  if (user) {
    localStorage.setItem("isAuthenticated", "true")
    localStorage.setItem("currentUserId", user.id)
    return user
  }
  
  return null
}

export function logout(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("isAuthenticated")
  localStorage.removeItem("currentUserId")
}

export function generateVerificationCode(): string {
  const code = Math.floor(1000 + Math.random() * 9000).toString()
  console.log('🔑 Generated verification code:', code, 'Type:', typeof code, 'Length:', code.length)
  return code
}

// Database storage for verification codes (persists across server restarts)
// These functions should only be called from server-side code (API routes)

// Helper function to get all stored codes (for debugging)
// This function should only be called from server-side code
export function getAllStoredCodes(): Array<{ email: string; code: string; expiresIn: number }> {
  try {
    // Lazy load db to avoid bundling issues in client components
    if (typeof window !== 'undefined') {
      console.warn('getAllStoredCodes called from client-side - this should only run server-side')
      return []
    }
    // Use dynamic require to prevent bundling - only works in Node.js
    let db
    if (typeof require !== 'undefined') {
      const dbModule = require('./db')
      db = dbModule.default || dbModule
    } else {
      throw new Error('Database not available - this function must run server-side')
    }
    const now = Date.now()
    const codes = db.prepare(`
      SELECT email, code, expiresAt 
      FROM verification_codes 
      WHERE expiresAt > ?
      ORDER BY createdAt DESC
    `).all(now) as Array<{ email: string; code: string; expiresAt: number }>
    
    return codes.map(c => ({
      email: c.email,
      code: c.code,
      expiresIn: Math.floor((c.expiresAt - now) / 1000)
    }))
  } catch (error) {
    console.error('Error getting stored codes:', error)
    return []
  }
}

export function saveVerificationCode(email: string, code: string): void {
  // Normalize email (lowercase, trim) for consistent storage
  const normalizedEmail = email.toLowerCase().trim()
  const normalizedCode = code.trim()
  
  const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes
  
  try {
    // Lazy load db to avoid bundling issues in client components
    if (typeof window !== 'undefined') {
      console.warn('saveVerificationCode called from client-side - this should only run server-side')
      return
    }
    // Use dynamic require to prevent bundling - only works in Node.js
    let db
    if (typeof require !== 'undefined') {
      const dbModule = require('./db')
      db = dbModule.default || dbModule
    } else {
      throw new Error('Database not available - this function must run server-side')
    }
    
    // Ensure table exists (it should be created by db.ts initialization, but check anyway)
    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS verification_codes (
          email TEXT PRIMARY KEY,
          code TEXT NOT NULL,
          expiresAt INTEGER NOT NULL,
          createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
        );
        CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
        CREATE INDEX IF NOT EXISTS idx_verification_codes_expiresAt ON verification_codes(expiresAt);
      `)
    } catch (tableError: any) {
      if (tableError?.code !== 'SQLITE_BUSY') {
        console.warn('⚠️ Could not create verification_codes table:', tableError?.message)
      }
    }
    
    // Delete any existing code for this email
    db.prepare('DELETE FROM verification_codes WHERE email = ?').run(normalizedEmail)
    
    // Insert new code
    db.prepare(`
      INSERT INTO verification_codes (email, code, expiresAt, createdAt)
      VALUES (?, ?, ?, ?)
    `).run(normalizedEmail, normalizedCode, expiresAt, Date.now())
    
    const expiresIn = Math.floor((expiresAt - Date.now()) / 1000)
    console.log('💾 Saved verification code to database for:', normalizedEmail, 'Code:', normalizedCode, `Expires in ${expiresIn} seconds`)
    
    // Clean up expired codes
    const now = Date.now()
    db.prepare('DELETE FROM verification_codes WHERE expiresAt <= ?').run(now)
  } catch (error: any) {
    console.error('❌ Error saving verification code:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      name: error?.name
    })
    // Don't throw - log the error but allow signup to continue
    // The code will still be returned in the response
    console.warn('⚠️ Verification code save failed, but continuing signup process')
  }
}

export function verifyCode(email: string, code: string): boolean {
  // Normalize email (lowercase, trim) for consistent lookup
  const normalizedEmail = email.toLowerCase().trim()
  const normalizedCode = code.trim()
  
  try {
    // Lazy load db to avoid bundling issues in client components
    if (typeof window !== 'undefined') {
      console.warn('verifyCode called from client-side - this should only run server-side')
      return false
    }
    // Use dynamic require to prevent bundling - only works in Node.js
    let db
    if (typeof require !== 'undefined') {
      const dbModule = require('./db')
      db = dbModule.default || dbModule
    } else {
      throw new Error('Database not available - this function must run server-side')
    }
    
    // Ensure table exists
    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS verification_codes (
          email TEXT PRIMARY KEY,
          code TEXT NOT NULL,
          expiresAt INTEGER NOT NULL,
          createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
        );
        CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
        CREATE INDEX IF NOT EXISTS idx_verification_codes_expiresAt ON verification_codes(expiresAt);
      `)
    } catch (tableError: any) {
      if (tableError?.code !== 'SQLITE_BUSY') {
        console.warn('⚠️ Could not create verification_codes table:', tableError?.message)
      }
    }
    
    // Get code from database
    const now = Date.now()
    console.log('🔍 Looking up code for email:', normalizedEmail, 'at time:', now)
    
    // First, check all codes in the table for debugging
    const allCodes = db.prepare('SELECT email, code, expiresAt FROM verification_codes').all() as Array<{ email: string; code: string; expiresAt: number }>
    console.log('📋 All codes in database:', allCodes.map(c => ({ email: c.email, code: c.code, expiresAt: c.expiresAt, expired: c.expiresAt <= now })))
    
    const stored = db.prepare(`
      SELECT code, expiresAt 
      FROM verification_codes 
      WHERE email = ? AND expiresAt > ?
    `).get(normalizedEmail, now) as { code: string; expiresAt: number } | undefined
    
    if (!stored) {
      console.log('❌ No verification code found for:', normalizedEmail)
      // Get available emails for debugging
      const available = db.prepare(`
        SELECT email FROM verification_codes WHERE expiresAt > ?
      `).all(now) as Array<{ email: string }>
      console.log('📋 Available codes:', available.map(a => a.email))
      return false
    }
    
    const timeRemaining = stored.expiresAt - now
    if (timeRemaining <= 0) {
      console.log('❌ Verification code expired for:', normalizedEmail, `Expired ${Math.abs(timeRemaining)}ms ago`)
      // Delete expired code
      db.prepare('DELETE FROM verification_codes WHERE email = ?').run(normalizedEmail)
      return false
    }
    console.log('⏰ Code still valid, expires in:', Math.floor(timeRemaining / 1000), 'seconds')
    
    console.log('🔍 Verifying code:', { 
      email: normalizedEmail, 
      enteredCode: normalizedCode, 
      storedCode: stored.code,
      codeMatch: stored.code === normalizedCode,
      codeType: typeof stored.code,
      enteredType: typeof normalizedCode,
      storedLength: stored.code.length,
      enteredLength: normalizedCode.length
    })
    
    // Compare codes (both should be strings, already trimmed)
    // Use strict equality after ensuring both are strings
    const storedCodeStr = String(stored.code).trim()
    const enteredCodeStr = String(normalizedCode).trim()
    
    if (storedCodeStr === enteredCodeStr) {
      console.log('✅ Verification code matched!')
      // Delete used code
      db.prepare('DELETE FROM verification_codes WHERE email = ?').run(normalizedEmail)
      return true
    }
    
    console.log('❌ Verification code did not match')
    console.log('🔍 Detailed comparison:', {
      stored: `"${storedCodeStr}"`,
      entered: `"${enteredCodeStr}"`,
      storedLength: storedCodeStr.length,
      enteredLength: enteredCodeStr.length,
      charCodes: {
        stored: Array.from(storedCodeStr).map(c => c.charCodeAt(0)),
        entered: Array.from(enteredCodeStr).map(c => c.charCodeAt(0))
      }
    })
    return false
  } catch (error) {
    console.error('Error verifying code:', error)
    return false
  }
}
