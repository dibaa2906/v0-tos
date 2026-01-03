"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, LogIn, LogOut, Coffee } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { toast } from "sonner"
import { format } from "date-fns"
import { checkDirectAccess } from "@/lib/navigation-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"

export default function ClockPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [attendance, setAttendance] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    checkDirectAccess(router)
    const user = getCurrentUser()
    if (user) {
      setUser(user)
      fetchTodayAttendance(user.email)
    }
    
    // Update clock every second
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [router])

  const fetchTodayAttendance = async (email: string) => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      const response = await fetch(`/api/attendance?userId=${encodeURIComponent(email)}&date=${today}`)
      const data = await response.json()
      if (data.success && data.record) {
        setAttendance(data.record)
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
    }
  }

  const handleClockIn = async () => {
    if (!user) return
    setLoading(true)
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.email,
          action: 'clockIn'
        })
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Clocked in successfully!')
        fetchTodayAttendance(user.email)
      } else {
        toast.error(data.error || 'Failed to clock in')
      }
    } catch (error) {
      toast.error('Error clocking in')
    } finally {
      setLoading(false)
    }
  }

  const handleClockOut = async () => {
    if (!user) return
    setLoading(true)
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.email,
          action: 'clockOut',
          recordId: attendance?.id
        })
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Clocked out successfully!')
        fetchTodayAttendance(user.email)
      } else {
        toast.error(data.error || 'Failed to clock out')
      }
    } catch (error) {
      toast.error('Error clocking out')
    } finally {
      setLoading(false)
    }
  }

  const calculateHours = () => {
    if (!attendance?.clockIn) return '0'
    const clockIn = new Date(attendance.clockIn)
    const clockOut = attendance.clockOut ? new Date(attendance.clockOut) : new Date()
    const diff = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)
    return diff.toFixed(2)
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Clock In/Out</h1>
            <p className="text-muted-foreground mt-2">Record your attendance</p>
          </div>

          {/* Current Time Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Current Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center py-4">
                {format(currentTime, 'HH:mm:ss')}
              </div>
              <div className="text-center text-muted-foreground">
                {format(currentTime, 'EEEE, MMMM d, yyyy')}
              </div>
            </CardContent>
          </Card>

          {/* Clock Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogIn className="h-5 w-5 text-green-600" />
                  Clock In
                </CardTitle>
                <CardDescription>Record your arrival time</CardDescription>
              </CardHeader>
              <CardContent>
                {attendance?.clockIn ? (
                  <div className="space-y-2">
                    <Badge variant="outline" className="w-full justify-center py-2">
                      Clocked in at {format(new Date(attendance.clockIn), 'HH:mm:ss')}
                    </Badge>
                  </div>
                ) : (
                  <Button 
                    onClick={handleClockIn} 
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Clock In Now
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogOut className="h-5 w-5 text-red-600" />
                  Clock Out
                </CardTitle>
                <CardDescription>Record your departure time</CardDescription>
              </CardHeader>
              <CardContent>
                {attendance?.clockOut ? (
                  <div className="space-y-2">
                    <Badge variant="outline" className="w-full justify-center py-2">
                      Clocked out at {format(new Date(attendance.clockOut), 'HH:mm:ss')}
                    </Badge>
                  </div>
                ) : (
                  <Button 
                    onClick={handleClockOut} 
                    disabled={loading || !attendance?.clockIn}
                    className="w-full"
                    size="lg"
                    variant="destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Clock Out Now
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Today's Summary */}
          {attendance && (
            <Card>
              <CardHeader>
                <CardTitle>Today's Summary</CardTitle>
                <CardDescription>Your attendance record for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Clock In</p>
                    <p className="text-lg font-semibold">
                      {attendance.clockIn ? format(new Date(attendance.clockIn), 'HH:mm') : '--:--'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Clock Out</p>
                    <p className="text-lg font-semibold">
                      {attendance.clockOut ? format(new Date(attendance.clockOut), 'HH:mm') : '--:--'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                    <p className="text-lg font-semibold">{calculateHours()} hrs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}

