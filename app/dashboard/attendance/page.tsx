"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, Calendar, Clock } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { format } from "date-fns"
import { checkDirectAccess } from "@/lib/navigation-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"

export default function AttendanceHistoryPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkDirectAccess(router)
    const user = getCurrentUser()
    if (user) {
      setUser(user)
      fetchAttendanceHistory(user.email)
    }
  }, [router])

  const fetchAttendanceHistory = async (email: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/attendance?userId=${encodeURIComponent(email)}`)
      const data = await response.json()
      if (data.success) {
        setAttendanceHistory(data.records || [])
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateHours = (record: any) => {
    if (!record.clockIn) return '0'
    const clockIn = new Date(record.clockIn)
    const clockOut = record.clockOut ? new Date(record.clockOut) : new Date()
    const diff = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)
    return diff.toFixed(2)
  }

  const getStatusBadge = (record: any) => {
    if (record.clockOut) {
      return <Badge variant="default">Completed</Badge>
    } else if (record.clockIn) {
      return <Badge variant="secondary">In Progress</Badge>
    }
    return <Badge variant="outline">No Record</Badge>
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <History className="h-8 w-8" />
              Attendance History
            </h1>
            <p className="text-muted-foreground mt-2">View your complete attendance records</p>
          </div>

          {loading ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">Loading attendance history...</div>
              </CardContent>
            </Card>
          ) : attendanceHistory.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">No attendance records found</div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {attendanceHistory.map((record) => (
                <Card key={record.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        <CardTitle>{format(new Date(record.date), 'EEEE, MMMM d, yyyy')}</CardTitle>
                      </div>
                      {getStatusBadge(record)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Clock In
                        </p>
                        <p className="text-lg font-semibold mt-1">
                          {record.clockIn ? format(new Date(record.clockIn), 'HH:mm:ss') : '--:--:--'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Clock Out
                        </p>
                        <p className="text-lg font-semibold mt-1">
                          {record.clockOut ? format(new Date(record.clockOut), 'HH:mm:ss') : '--:--:--'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Hours</p>
                        <p className="text-lg font-semibold mt-1">{calculateHours(record)} hrs</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="text-lg font-semibold mt-1 capitalize">{record.status || 'present'}</p>
                      </div>
                    </div>
                    {record.notes && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">Notes</p>
                        <p className="text-sm mt-1">{record.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
