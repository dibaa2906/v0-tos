"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, Plus, Calendar as CalendarIcon } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { format } from "date-fns"
import { toast } from "sonner"
import { checkDirectAccess } from "@/lib/navigation-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"

export default function LeaveApplicationPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [leaveApplications, setLeaveApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: ''
  })

  useEffect(() => {
    checkDirectAccess(router)
    const user = getCurrentUser()
    if (user) {
      setUser(user)
      fetchLeaveApplications(user.email)
    }
  }, [router])

  const fetchLeaveApplications = async (email: string) => {
    try {
      const response = await fetch(`/api/leave?userId=${encodeURIComponent(email)}`)
      const data = await response.json()
      if (data.success) {
        setLeaveApplications(data.applications || [])
      }
    } catch (error) {
      console.error('Error fetching leave applications:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!formData.startDate || !formData.endDate || !formData.reason) {
      toast.error('Please fill in all required fields')
      return
    }

    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    
    if (end < start) {
      toast.error('End date must be after start date')
      return
    }

    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    setLoading(true)
    try {
      const response = await fetch('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.email,
          ...formData,
          days
        })
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Leave application submitted successfully!')
        setShowForm(false)
        setFormData({ leaveType: 'annual', startDate: '', endDate: '', reason: '' })
        fetchLeaveApplications(user.email)
      } else {
        toast.error(data.error || 'Failed to submit leave application')
      }
    } catch (error) {
      toast.error('Error submitting leave application')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Calendar className="h-8 w-8" />
                Leave Application
              </h1>
              <p className="text-muted-foreground mt-2">Apply for leave and track your applications</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>
          </div>

          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Submit Leave Application</CardTitle>
                <CardDescription>Fill in the details for your leave request</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="leaveType">Leave Type</Label>
                    <select
                      id="leaveType"
                      value={formData.leaveType}
                      onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md"
                      required
                    >
                      <option value="annual">Annual Leave</option>
                      <option value="sick">Sick Leave</option>
                      <option value="emergency">Emergency Leave</option>
                      <option value="unpaid">Unpaid Leave</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="mt-1"
                      rows={4}
                      placeholder="Please provide a reason for your leave..."
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      Submit Application
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>My Leave Applications</CardTitle>
              <CardDescription>Track the status of your leave applications</CardDescription>
            </CardHeader>
            <CardContent>
              {leaveApplications.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No leave applications found. Click "New Application" to apply for leave.
                </div>
              ) : (
                <div className="space-y-4">
                  {leaveApplications.map((application) => (
                    <Card key={application.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5" />
                            <CardTitle className="text-lg capitalize">{application.leaveType} Leave</CardTitle>
                          </div>
                          {getStatusBadge(application.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Start Date</p>
                            <p className="font-semibold">{format(new Date(application.startDate), 'MMM d, yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">End Date</p>
                            <p className="font-semibold">{format(new Date(application.endDate), 'MMM d, yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Duration</p>
                            <p className="font-semibold">{application.days} day{application.days !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-muted-foreground">Reason</p>
                          <p className="text-sm mt-1">{application.reason}</p>
                        </div>
                        {application.status === 'approved' && application.approvedAt && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">
                              Approved on {format(new Date(application.approvedAt), 'MMM d, yyyy')}
                            </p>
                          </div>
                        )}
                        {application.status === 'rejected' && application.rejectionReason && (
                          <div className="mt-2">
                            <p className="text-xs text-red-600">
                              Rejection reason: {application.rejectionReason}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}

