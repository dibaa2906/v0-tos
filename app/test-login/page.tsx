"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestLoginPage() {
  const [results, setResults] = useState<string[]>([])

  const addResult = (msg: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`])
    console.log(msg)
  }

  const testLogin = async () => {
    setResults([])
    addResult("🧪 Starting login test...")
    
    // Test 1: Check localStorage
    try {
      addResult("✅ localStorage is available")
      localStorage.setItem('test', 'value')
      const testValue = localStorage.getItem('test')
      if (testValue === 'value') {
        addResult("✅ localStorage read/write works")
        localStorage.removeItem('test')
      } else {
        addResult("❌ localStorage read/write failed")
      }
    } catch (e) {
      addResult(`❌ localStorage error: ${e}`)
    }

    // Test 2: Test API call
    try {
      addResult("📡 Testing API call...")
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username: 'admin', password: 'adminpass1' })
      })
      
      addResult(`📥 Response status: ${response.status} ${response.statusText}`)
      addResult(`📥 Response OK: ${response.ok}`)
      
      const text = await response.text()
      addResult(`📦 Response text length: ${text.length}`)
      
      try {
        const result = JSON.parse(text)
        addResult(`📦 Parsed JSON: ${JSON.stringify(result).substring(0, 100)}...`)
        
        if (result.success) {
          addResult("✅ Login API returned success!")
          
          // Test storing in localStorage
          try {
            localStorage.setItem('isAuthenticated', 'true')
            localStorage.setItem('currentUserId', result.user.id)
            localStorage.setItem('currentUser', JSON.stringify(result.user))
            addResult("✅ Stored in localStorage successfully")
            
            // Verify
            const stored = localStorage.getItem('currentUser')
            if (stored) {
              addResult("✅ Verified localStorage contains user data")
            } else {
              addResult("❌ localStorage verification failed")
            }
          } catch (e) {
            addResult(`❌ Failed to store in localStorage: ${e}`)
          }
        } else {
          addResult(`❌ Login failed: ${result.error || 'Unknown error'}`)
        }
      } catch (e) {
        addResult(`❌ Failed to parse JSON: ${e}`)
        addResult(`📦 Raw response: ${text.substring(0, 200)}`)
      }
    } catch (e) {
      addResult(`❌ API call failed: ${e}`)
    }

    addResult("🏁 Test complete!")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Login Diagnostic Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testLogin} className="w-full">
            Run Login Test
          </Button>
          
          <div className="bg-gray-100 p-4 rounded-md max-h-96 overflow-y-auto">
            <pre className="text-sm font-mono">
              {results.length === 0 ? "Click 'Run Login Test' to start..." : results.join('\n')}
            </pre>
          </div>
          
          <div className="text-sm text-gray-600">
            <p><strong>What this tests:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>localStorage availability and functionality</li>
              <li>API connectivity and response</li>
              <li>JSON parsing</li>
              <li>Data storage in localStorage</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
