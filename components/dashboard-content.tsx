"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, XCircle, Calendar, TrendingUp, FileText, ArrowRight, User, History } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { getTodayAttendance, getAttendanceRecords } from "@/lib/attendance"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { markLegitimateNavigation } from "@/lib/navigation-guard"

export function DashboardContent() {
  const [user, setUser] = useState<any>(null)
  const [attendance, setAttendance] = useState<any>(null)
  const [stats, setStats] = useState({
    thisWeek: 0,
    thisMonth: 0,
    onTimeCount: 0,
    lateCount: 0
  })
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        const todayAttendance = getTodayAttendance(currentUser.id)
        setAttendance(todayAttendance)
        
        // Calculate stats
        const records = getAttendanceRecords(currentUser.id)
        const now = new Date()
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        
        const thisWeek = records.filter(r => new Date(r.date) >= weekAgo).length
        const thisMonth = records.filter(r => new Date(r.date) >= monthAgo).length
        const onTime = records.filter(r => r.status === "on-time").length
        const late = records.filter(r => r.status === "late").length
        
        setStats({
          thisWeek,
          thisMonth,
          onTimeCount: onTime,
          lateCount: late
        })
      }
    }
    fetchUser()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "on-time":
        return <Badge className="bg-green-500">On Time</Badge>
      case "late":
        return <Badge className="bg-yellow-500">Late</Badge>
      case "absent":
        return <Badge className="bg-red-500">Absent</Badge>
      default:
        return null
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.fullName}!
        </h1>
        <p className="text-muted-foreground mt-2">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Today's Status */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-turquoise-50 to-turquoise-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Today's Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attendance ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {getStatusBadge(attendance.status)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Clock In</p>
                  <p className="text-lg font-semibold">{attendance.clockInTime || "Not yet"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Clock Out</p>
                  <p className="text-lg font-semibold">{attendance.clockOutTime || "Not yet"}</p>
                </div>
              </div>
              <Button 
                onClick={() => router.push('/dashboard/attendance')}
                className="w-full"
                variant={attendance.clockOutTime ? "outline" : "emerald"}
                disabled={!!attendance.clockOutTime}
              >
                {attendance.clockOutTime ? "Already Clocked Out" : "Clock Out Now"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-muted-foreground">You haven't clocked in today yet.</p>
              <Button 
                onClick={() => router.push('/dashboard/attendance')}
                className="w-full"
                variant="emerald"
              >
                Clock In Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow aspect-square"
              onClick={() => { markLegitimateNavigation(); router.push('/dashboard/attendance') }}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 h-full">
                <Clock className="h-8 w-8 mb-2 text-primary" />
                <p className="text-sm font-medium text-center">Clock In/Out</p>
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow aspect-square"
              onClick={() => { markLegitimateNavigation(); router.push('/dashboard/logs') }}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 h-full">
                <FileText className="h-8 w-8 mb-2 text-primary" />
                <p className="text-sm font-medium text-center">Volume Log</p>
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow aspect-square"
              onClick={() => { markLegitimateNavigation(); router.push('/dashboard/leave') }}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 h-full">
                <Calendar className="h-8 w-8 mb-2 text-primary" />
                <p className="text-sm font-medium text-center">Apply Leave</p>
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow aspect-square"
              onClick={() => { markLegitimateNavigation(); router.push('/dashboard/history') }}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 h-full">
                <History className="h-8 w-8 mb-2 text-primary" />
                <p className="text-sm font-medium text-center">Attendance History</p>
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow aspect-square"
              onClick={() => { markLegitimateNavigation(); router.push('/dashboard/profile') }}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 h-full">
                <User className="h-8 w-8 mb-2 text-primary" />
                <p className="text-sm font-medium text-center">Profile</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
