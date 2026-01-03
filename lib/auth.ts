// Simple authentication utilities for demo purposes
export interface User {
  email: string
  name: string
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("isAuthenticated") === "true"
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  const email = localStorage.getItem("userEmail")
  if (!email) return null

  return {
    email,
    name: email.split("@")[0],
  }
}

export function logout(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("isAuthenticated")
  localStorage.removeItem("userEmail")
}

// Departments list
export const DEPARTMENTS = [
  'Administration',
  'Finance',
  'Operation',
  'Safety And Security',
  'Technical And Maintenance',
  'General Manager Office'
] as const
