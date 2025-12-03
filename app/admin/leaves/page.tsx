"use client"

import { useState, useEffect, useMemo } from 'react'
import { AdminGuard } from '@/components/auth-guard'
import { AdminLayout } from '@/components/admin-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, CheckCircle2, XCircle, Download, Printer, Calendar, Clock, User, FileText, Eye } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { exportTableToPDF, exportTableToCSV } from '@/lib/pdf-export'
import { toast } from 'sonner'
import { getCurrentUser } from '@/lib/auth'

export default function LeaveReviewQueuePage() {
  const [allLeaves, setAllLeaves] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedLeaves, setSelectedLeaves] = useState<Set<string>>(new Set())
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean
    leaveId: string | null
    action: 'approve' | 'reject' | null
    bulk: boolean
  }>({ open: false, leaveId: null, action: null, bulk: false })
  const [viewLeaveDialog, setViewLeaveDialog] = useState<{
    open: boolean
    leave: any | null
  }>({ open: false, leave: null })
  const [reviewerNote, setReviewerNote] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [viewMcDialog, setViewMcDialog] = useState<{ open: boolean; mcFile: string | null }>({ open: false, mcFile: null })

  useEffect(() => {
    getCurrentUser().then(user => {
      setCurrentUser(user)
      fetchLeaves(user)
    })
  }, [])

  const isHOD = currentUser?.department?.toLowerCase() === 'pentadbiran'
  const approverType = isHOD ? 'hod' : 'supervisor'

  const getLeaveTypeBadge = (leaveType: string) => {
    switch (leaveType) {
      case 'regular':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] px-1.5 py-0.5">Regular</Badge>
      case 'emergency':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-[10px] px-1.5 py-0.5">Emergency</Badge>
      case 'mc':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] px-1.5 py-0.5">MC</Badge>
      default:
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">{leaveType || 'Regular'}</Badge>
    }
  }

  const fetchLeaves = async (user?: any) => {
    try {
      const userToUse = user || currentUser
      if (!userToUse) return
      
      const isHODUser = userToUse.department?.toLowerCase() === 'pentadbiran'
      const params = new URLSearchParams()
      
      if (isHODUser) {
        params.append('approverType', 'hod')
      } else {
        params.append('approverType', 'supervisor')
        params.append('approverDept', userToUse.department || '')
      }
      
      const res = await fetch(`/api/leaves?${params.toString()}`)
      const data = await res.json()
      if (data.success && data.leaves) {
        setAllLeaves(data.leaves || [])
      }
    } catch (error) {
      console.error('Error fetching leaves:', error)
      toast.error('Failed to load leave applications')
    } finally {
      setLoading(false)
    }
  }

  const pendingLeaves = useMemo(() => {
    if (isHOD) {
      return allLeaves.filter(leave => leave.status === 'supervisor_approved')
    } else {
      return allLeaves.filter(leave => leave.status === 'pending')
    }
  }, [allLeaves, isHOD])

  const filteredLeaves = useMemo(() => {
    if (!search) return pendingLeaves
    const searchLower = search.toLowerCase()
    return pendingLeaves.filter(leave =>
      leave.fullName?.toLowerCase().includes(searchLower) ||
      leave.reason?.toLowerCase().includes(searchLower) ||
      leave.email?.toLowerCase().includes(searchLower)
    )
  }, [pendingLeaves, search])


  const getUrgencyLevel = (startDate: string) => {
    if (!startDate) return 'normal'
    const start = new Date(startDate)
    const today = new Date()
    const daysUntil = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntil < 0) return 'overdue' // Past date
    if (daysUntil <= 3) return 'urgent' // Within 3 days
    if (daysUntil <= 7) return 'soon' // Within a week
    return 'normal'
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'overdue': return 'border-red-300 bg-red-50'
      case 'urgent': return 'border-amber-300 bg-amber-50'
      case 'soon': return 'border-yellow-300 bg-yellow-50'
      default: return 'border-turquoise-200 bg-white'
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeaves(new Set(filteredLeaves.map(l => l.id)))
    } else {
      setSelectedLeaves(new Set())
    }
  }

  const handleSelectLeave = (leaveId: string, checked: boolean) => {
    const newSelected = new Set(selectedLeaves)
    if (checked) {
      newSelected.add(leaveId)
    } else {
      newSelected.delete(leaveId)
    }
    setSelectedLeaves(newSelected)
  }

  const handleReview = async (leaveIds: string[], action: 'approve' | 'reject') => {
    if (!currentUser) {
      toast.error('User information not available')
      return
    }
    
    try {
      const promises = leaveIds.map(id =>
        fetch('/api/leaves', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leaveId: id,
            action,
            reviewerNote,
            approverType,
            approverId: currentUser.id
          })
        })
      )

      await Promise.all(promises)
      toast.success(`Successfully ${action}d ${leaveIds.length} leave application(s)`)
      setReviewDialog({ open: false, leaveId: null, action: null, bulk: false })
      setReviewerNote('')
      setSelectedLeaves(new Set())
      fetchLeaves()
    } catch (error) {
      console.error('Error reviewing leaves:', error)
      toast.error(`Failed to ${action} leave application(s)`)
    }
  }

  const openReviewDialog = (action: 'approve' | 'reject', leaveId?: string) => {
    if (leaveId) {
      setReviewDialog({ open: true, leaveId, action, bulk: false })
    } else {
      if (selectedLeaves.size === 0) {
        toast.error('Please select at least one leave application')
        return
      }
      setReviewDialog({ open: true, leaveId: null, action, bulk: true })
    }
  }

  const handleExportPDF = () => {
    exportTableToPDF({
      title: 'Leave Review Queue',
      columns: [
        { header: 'Intern', accessor: 'fullName', width: 50 },
        { header: 'Type', accessor: () => 'Leave', width: 30 },
        { header: 'Start Date', accessor: 'startDate', width: 40 },
        { header: 'End Date', accessor: 'endDate', width: 40 },
        { header: 'Reason', accessor: 'reason', width: 80 },
        { header: 'Applied At', accessor: (row: any) => row.appliedAt ? new Date(row.appliedAt).toLocaleDateString() : '-', width: 40 }
      ],
      data: filteredLeaves,
      filename: `leave-review-queue-${new Date().toISOString().split('T')[0]}.pdf`,
      userName: currentUser?.fullName,
      userDepartment: currentUser?.department
    })
  }

  const handleExportCSV = () => {
    exportTableToCSV({
      title: 'Leave Review Queue',
      columns: [
        { header: 'Intern', accessor: 'fullName' },
        { header: 'Type', accessor: () => 'Leave' },
        { header: 'Start Date', accessor: 'startDate' },
        { header: 'End Date', accessor: 'endDate' },
        { header: 'Reason', accessor: 'reason' },
        { header: 'Applied At', accessor: (row: any) => row.appliedAt ? new Date(row.appliedAt).toLocaleDateString() : '-' }
      ],
      data: filteredLeaves,
      filename: `leave-review-queue-${new Date().toISOString().split('T')[0]}.csv`,
      userName: currentUser?.fullName,
      userDepartment: currentUser?.department
    })
  }

  if (loading) {
    return (
      <AdminGuard>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">Loading...</div>
        </AdminLayout>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-turquoise-900">Leave Review Queue</h1>
            <div className="flex gap-1.5">
              <Button onClick={handleExportPDF} variant="outline" size="sm" className="border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50 h-8 text-xs">
                <Download className="h-3 w-3 mr-1" />
                PDF
              </Button>
              <Button onClick={handleExportCSV} variant="outline" size="sm" className="border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50 h-8 text-xs">
                <Download className="h-3 w-3 mr-1" />
                CSV
              </Button>
              <Button onClick={() => window.print()} variant="outline" size="sm" className="border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50 h-8 text-xs">
                <Printer className="h-3 w-3 mr-1" />
                Print
              </Button>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedLeaves.size > 0 && (
            <Card className="border-turquoise-300 bg-turquoise-50">
              <CardContent className="p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-turquoise-900">
                    {selectedLeaves.size} leave application(s) selected
                  </span>
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      onClick={() => openReviewDialog('approve')}
                      className="bg-green-600 hover:bg-green-700 h-7 text-xs"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Approve Selected
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openReviewDialog('reject')}
                      className="h-7 text-xs"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Reject Selected
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card className="border-turquoise-200">
            <CardContent className="p-2.5">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-turquoise-500" />
                  <Input
                    placeholder="Search by name, email, or reason..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-8 text-sm border-turquoise-300 focus:border-turquoise-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* List/Table View */}
          {filteredLeaves.length === 0 ? (
            <Card className="border-turquoise-200">
              <CardContent className="p-6 text-center text-gray-500 text-sm">
                {pendingLeaves.length === 0
                  ? 'No pending leave applications'
                  : 'No leave applications match your search'}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-turquoise-200">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-turquoise-50 border-b border-turquoise-200">
                        <th className="text-left p-2 font-semibold text-xs text-turquoise-900 w-10">
                          <Checkbox
                            checked={selectedLeaves.size === filteredLeaves.length && filteredLeaves.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </th>
                        <th className="text-left p-2 font-semibold text-xs text-turquoise-900">Intern</th>
                        <th className="text-left p-2 font-semibold text-xs text-turquoise-900">Department</th>
                        <th className="text-left p-2 font-semibold text-xs text-turquoise-900">Type</th>
                        <th className="text-left p-2 font-semibold text-xs text-turquoise-900">Start Date</th>
                        <th className="text-left p-2 font-semibold text-xs text-turquoise-900">End Date</th>
                        <th className="text-left p-2 font-semibold text-xs text-turquoise-900">Days</th>
                        <th className="text-left p-2 font-semibold text-xs text-turquoise-900">Reason</th>
                        <th className="text-left p-2 font-semibold text-xs text-turquoise-900">Applied At</th>
                        <th className="text-left p-2 font-semibold text-xs text-turquoise-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeaves.map((leave) => {
                        const urgency = getUrgencyLevel(leave.startDate)
                        const startDate = leave.startDate ? new Date(leave.startDate) : null
                        const endDate = leave.endDate ? new Date(leave.endDate) : null
                        const daysDiff = startDate && endDate 
                          ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
                          : 0

                        return (
                          <tr key={leave.id} className="border-b border-turquoise-100 hover:bg-turquoise-50">
                            <td className="p-2">
                              <Checkbox
                                checked={selectedLeaves.has(leave.id)}
                                onCheckedChange={(checked) =>
                                  handleSelectLeave(leave.id, checked as boolean)
                                }
                              />
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={leave.profilePhoto || '/placeholder-user.jpg'} />
                                  <AvatarFallback className="bg-turquoise-100 text-turquoise-700 text-xs">
                                    {leave.fullName?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <div className="font-medium text-sm">{leave.fullName}</div>
                                    {urgency === 'urgent' && (
                                      <Badge variant="destructive" className="text-[10px] px-1 py-0">Urgent</Badge>
                                    )}
                                    {urgency === 'overdue' && (
                                      <Badge variant="destructive" className="text-[10px] px-1 py-0">Overdue</Badge>
                                    )}
                                    {urgency === 'soon' && (
                                      <Badge className="text-[10px] px-1 py-0 bg-yellow-500">Soon</Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500">{leave.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-2 text-xs text-gray-600">{leave.department || '-'}</td>
                            <td className="p-2">
                              {getLeaveTypeBadge(leave.leaveType || 'regular')}
                            </td>
                            <td className="p-2 text-xs">{startDate ? startDate.toLocaleDateString() : '-'}</td>
                            <td className="p-2 text-xs">{endDate ? endDate.toLocaleDateString() : '-'}</td>
                            <td className="p-2 text-xs text-gray-600">{daysDiff > 0 ? `${daysDiff} day${daysDiff !== 1 ? 's' : ''}` : '-'}</td>
                            <td className="p-2">
                              <button
                                onClick={() => setViewLeaveDialog({ open: true, leave })}
                                className="text-left text-[#20b2aa] hover:text-[#1a9b94] hover:underline text-xs max-w-xs truncate block w-full"
                                title="Click to view full reason"
                              >
                                {leave.reason ? (leave.reason.length > 50 ? leave.reason.substring(0, 50) + '...' : leave.reason) : 'No reason provided'}
                              </button>
                            </td>
                            <td className="p-2 text-xs text-gray-600">
                              {leave.appliedAt ? new Date(leave.appliedAt).toLocaleDateString() : '-'}
                            </td>
                            <td className="p-2">
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300 h-7 text-xs px-2"
                                  onClick={() => openReviewDialog('approve', leave.id)}
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-7 text-xs px-2"
                                  onClick={() => openReviewDialog('reject', leave.id)}
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Review Dialog */}
        <Dialog
          open={reviewDialog.open}
          onOpenChange={(open) => {
            if (!open) {
              setReviewDialog({ open: false, leaveId: null, action: null, bulk: false })
              setReviewerNote('')
            }
          }}
        >
          <DialogContent className="border-turquoise-200">
            <DialogHeader>
              <DialogTitle className="text-turquoise-900">
                {reviewDialog.action === 'approve' ? 'Approve' : 'Reject'} Leave
                {reviewDialog.bulk && ` (${selectedLeaves.size} applications)`}
              </DialogTitle>
              <DialogDescription>
                {reviewDialog.action === 'approve'
                  ? 'Add an optional note for this approval'
                  : 'Please provide a reason for rejection'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reviewerNote">Reviewer Note</Label>
                <Textarea
                  id="reviewerNote"
                  value={reviewerNote}
                  onChange={(e) => setReviewerNote(e.target.value)}
                  placeholder={
                    reviewDialog.action === 'approve'
                      ? 'Optional approval note...'
                      : 'Please provide a reason for rejection...'
                  }
                  rows={4}
                  className="mt-2 border-turquoise-300 focus:border-turquoise-500"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setReviewDialog({ open: false, leaveId: null, action: null, bulk: false })
                  setReviewerNote('')
                }}
                className="border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const leaveIds = reviewDialog.bulk
                    ? Array.from(selectedLeaves)
                    : reviewDialog.leaveId
                    ? [reviewDialog.leaveId]
                    : []
                  if (leaveIds.length > 0 && reviewDialog.action) {
                    handleReview(leaveIds, reviewDialog.action)
                  }
                }}
                variant={reviewDialog.action === 'reject' ? 'destructive' : 'default'}
                className={
                  reviewDialog.action === 'approve'
                    ? 'bg-turquoise-600 hover:bg-turquoise-700'
                    : ''
                }
              >
                {reviewDialog.action === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Leave Details Dialog */}
        <Dialog open={viewLeaveDialog.open} onOpenChange={(open) => setViewLeaveDialog({ open, leave: null })}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Leave Application Details</DialogTitle>
              <DialogDescription>
                Full details of the leave application
              </DialogDescription>
            </DialogHeader>
            {viewLeaveDialog.leave && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Intern</Label>
                  <p className="text-sm text-gray-900 mt-1">{viewLeaveDialog.leave.fullName}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Department</Label>
                  <p className="text-sm text-gray-900 mt-1">{viewLeaveDialog.leave.department || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Leave Type</Label>
                  <div className="mt-1">
                    {getLeaveTypeBadge(viewLeaveDialog.leave.leaveType || 'regular')}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Start Date</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {viewLeaveDialog.leave.startDate ? new Date(viewLeaveDialog.leave.startDate).toLocaleDateString() : '-'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">End Date</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {viewLeaveDialog.leave.endDate ? new Date(viewLeaveDialog.leave.endDate).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Reason / Description</Label>
                  <p className="text-sm text-gray-900 mt-2 p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                    {viewLeaveDialog.leave.reason || '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Applied At</Label>
                  <p className="text-sm text-gray-900 mt-1">
                    {viewLeaveDialog.leave.appliedAt ? new Date(viewLeaveDialog.leave.appliedAt).toLocaleString() : '-'}
                  </p>
                </div>
                {viewLeaveDialog.leave.reviewerNote && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Reviewer Note</Label>
                    <p className="text-sm text-gray-900 mt-2 p-3 bg-gray-50 rounded-md">
                      {viewLeaveDialog.leave.reviewerNote}
                    </p>
                  </div>
                )}
                {viewLeaveDialog.leave.mcFile && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Medical Certificate</Label>
                    <div className="mt-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewMcDialog({ open: true, mcFile: viewLeaveDialog.leave.mcFile })}
                        className="h-8 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View MC
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setViewLeaveDialog({ open: false, leave: null })}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MC View Dialog */}
        <Dialog open={viewMcDialog.open} onOpenChange={(open) => setViewMcDialog({ open, mcFile: null })}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Medical Certificate</DialogTitle>
              <DialogDescription>View medical certificate</DialogDescription>
            </DialogHeader>
            {viewMcDialog.mcFile && (
              <div className="mt-4">
                {viewMcDialog.mcFile.startsWith('data:image/') ? (
                  <img 
                    src={viewMcDialog.mcFile} 
                    alt="Medical Certificate" 
                    className="max-w-full h-auto rounded-lg border border-gray-200"
                  />
                ) : viewMcDialog.mcFile.startsWith('data:application/pdf') ? (
                  <iframe
                    src={viewMcDialog.mcFile}
                    className="w-full h-[70vh] border border-gray-200 rounded-lg"
                    title="Medical Certificate PDF"
                  />
                ) : (
                  <div className="flex items-center justify-center p-8 border border-gray-200 rounded-lg">
                    <p className="text-gray-500">Unable to display file. Please download to view.</p>
                  </div>
                )}
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = viewMcDialog.mcFile!
                      link.download = 'medical-certificate'
                      link.click()
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminGuard>
  )
}
