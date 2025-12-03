"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DebugAuthPage() {
  const [authStatus, setAuthStatus] = useState<any>(null)

  const checkAuth = () => {
    const status = {
      isAuthenticated: localStorage.getItem('isAuthenticated'),
      currentUserId: localStorage.getItem('currentUserId'),
      currentUser: localStorage.getItem('currentUser'),
      timestamp: new Date().toLocaleTimeString(),
      allKeys: [] as string[]
    }

    // Get all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key !== null) {
        status.allKeys.push(key)
      }
    }

    setAuthStatus(status)
  }

  useEffect(() => {
    checkAuth()
    const interval = setInterval(checkAuth, 1000)
    return () => clearInterval(interval)
  }, [])

  const clearAuth = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('currentUserId')
    localStorage.removeItem('currentUser')
    checkAuth()
  }

  const setTestAuth = () => {
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('currentUserId', 'test-user-123')
    localStorage.setItem('currentUser', JSON.stringify({ id: 'test-user-123', fullName: 'Test User' }))
    checkAuth()
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Authentication Debug Page</CardTitle>
          <p className="text-sm text-gray-600">This page shows your authentication status in real-time</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={checkAuth}>Refresh Status</Button>
            <Button onClick={setTestAuth} variant="outline">Set Test Auth</Button>
            <Button onClick={clearAuth} variant="destructive">Clear Auth</Button>
          </div>

          {authStatus && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${authStatus.isAuthenticated === 'true' ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'}`}>
                <h3 className="font-bold text-lg mb-2">
                  {authStatus.isAuthenticated === 'true' ? '✅ AUTHENTICATED' : '❌ NOT AUTHENTICATED'}
                </h3>
                <p className="text-sm">Last checked: {authStatus.timestamp}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-100 rounded">
                  <h4 className="font-semibold mb-2">isAuthenticated</h4>
                  <p className="text-sm font-mono">{authStatus.isAuthenticated || 'null'}</p>
                </div>

                <div className="p-4 bg-gray-100 rounded">
                  <h4 className="font-semibold mb-2">currentUserId</h4>
                  <p className="text-sm font-mono">{authStatus.currentUserId || 'null'}</p>
                </div>

                <div className="p-4 bg-gray-100 rounded md:col-span-2">
                  <h4 className="font-semibold mb-2">currentUser</h4>
                  <pre className="text-xs overflow-auto bg-white p-2 rounded">
                    {authStatus.currentUser ? JSON.stringify(JSON.parse(authStatus.currentUser), null, 2) : 'null'}
                  </pre>
                </div>

                <div className="p-4 bg-gray-100 rounded md:col-span-2">
                  <h4 className="font-semibold mb-2">All localStorage Keys</h4>
                  <div className="flex flex-wrap gap-2">
                    {authStatus.allKeys.map((key: string) => (
                      <span key={key} className="px-2 py-1 bg-blue-100 rounded text-sm">{key}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded">
                <h4 className="font-semibold mb-2">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => window.location.href = '/dashboard'}>
                    Go to Dashboard
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => window.location.href = '/login'}>
                    Go to Login
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => window.location.href = '/'}>
                    Go to Home
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


