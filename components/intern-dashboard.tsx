"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, FileText, Calendar, History, User } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { format } from "date-fns"
import Link from "next/link"

export function InternDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [attendance, setAttendance] = useState<any>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      fetchTodayAttendance(currentUser.email)
    }
  }, [])

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

  const handleClockIn = () => {
    router.push('/dashboard/clock')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Intern Attendance System</h1>
        {user && (
          <>
            <p className="text-xl font-semibold mt-2 text-foreground">
              Welcome back, {user.name || user.email.split('@')[0]}!
            </p>
            <p className="text-muted-foreground mt-1">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </>
        )}
      </div>

      {/* Today's Attendance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          {attendance?.clockIn ? (
            <div className="space-y-4">
              <p className="text-lg">You clocked in at {format(new Date(attendance.clockIn), 'HH:mm')}</p>
              {attendance.clockOut ? (
                <p className="text-muted-foreground">Clocked out at {format(new Date(attendance.clockOut), 'HH:mm')}</p>
              ) : (
                <Button onClick={() => router.push('/dashboard/clock')} className="mt-4">
                  Clock Out Now
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">You haven't clocked in today yet.</p>
              <Button onClick={handleClockIn} size="lg" className="mt-4">
                Clock In Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Link href="/dashboard/clock">
            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Clock className="h-8 w-8 mb-2 text-primary" />
                <p className="font-medium text-center">Clock In/Out</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/logs">
            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <FileText className="h-8 w-8 mb-2 text-primary" />
                <p className="font-medium text-center">Volume Log</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/leave">
            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Calendar className="h-8 w-8 mb-2 text-primary" />
                <p className="font-medium text-center">Apply Leave</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/attendance">
            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <History className="h-8 w-8 mb-2 text-primary" />
                <p className="font-medium text-center">Attendance History</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/profile">
            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <User className="h-8 w-8 mb-2 text-primary" />
                <p className="font-medium text-center">Profile</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}

