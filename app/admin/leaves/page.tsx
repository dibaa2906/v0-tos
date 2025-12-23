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
import { Search, Download, Printer, FileText, Eye, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { exportTableToPDF, exportTableToCSV } from '@/lib/pdf-export'
import { toast } from 'sonner'
import { getCurrentUser, DEPARTMENTS } from '@/lib/auth'

export default function LeaveReviewQueuePage() {
  const [allLeaves, setAllLeaves] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
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
  const [viewMode, setViewMode] = useState<'all' | 'mydept' | 'default'>('default')

  useEffect(() => {
    // Check URL parameters for view mode
    const params = new URLSearchParams(window.location.search)
    const view = params.get('view') as 'all' | 'mydept' | null
    if (view === 'all' || view === 'mydept') {
      setViewMode(view)
    }
    
    getCurrentUser().then(user => {
      setCurrentUser(user)
      fetchLeaves(user, view)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-[10px] px-1.5 py-0.5">Pending</Badge>
      case 'supervisor_approved':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] px-1.5 py-0.5">Supervisor Approved</Badge>
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] px-1.5 py-0.5">Approved</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] px-1.5 py-0.5">Rejected</Badge>
      default:
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">{status || 'Unknown'}</Badge>
    }
  }

  const fetchLeaves = async (user?: any, view?: string | null) => {
    try {
      const userToUse = user || currentUser
      if (!userToUse) return
      
      const params = new URLSearchParams()
      
      // If view=all, fetch ALL pending leaves (no department filter)
      if (view === 'all') {
        params.append('status', 'pending')
      } 
      // If view=mydept, fetch only department's pending leaves
      // For "My Dept" view, always show pending leaves from the department, regardless of user role
      else if (view === 'mydept') {
        params.append('status', 'pending')
        // Trim and normalize department name before sending
        const dept = (userToUse.department || '').trim()
        params.append('approverDept', dept)
        params.append('approverType', 'supervisor') // Use supervisor type to filter by department
        console.log('🔍 Fetching my dept leaves:', { department: dept, view: 'mydept' })
      }
      // Default behavior (admin sidebar): fetch ALL leaves (no status filter, no approver filter)
      // This shows all leave records including past ones
      else {
        // Don't add any status or approver filters - this will fetch all leaves
        console.log('🔍 Fetching all leaves (admin view)')
      }
      
      const res = await fetch(`/api/leaves?${params.toString()}`)
      const data = await res.json()
      if (data.success && data.leaves) {
        setAllLeaves(data.leaves || [])
        console.log('📋 Fetched leaves:', { count: data.leaves.length, view, params: params.toString() })
      } else {
        console.warn('⚠️ No leaves returned:', data)
        setAllLeaves([])
      }
    } catch (error) {
      console.error('Error fetching leaves:', error)
      toast.error('Failed to load leave applications')
      setAllLeaves([])
    } finally {
      setLoading(false)
    }
  }

  const pendingLeaves = useMemo(() => {
    // If view=all, show all pending leaves (already filtered by API)
    if (viewMode === 'all') {
      return allLeaves.filter(leave => leave.status === 'pending')
    }
    // If view=mydept, show pending leaves from department (already filtered by API)
    if (viewMode === 'mydept') {
      return allLeaves.filter(leave => leave.status === 'pending')
    }
    // Default behavior (admin sidebar): show ALL leaves including past ones
    // No filtering - show all leaves regardless of status
    return allLeaves
  }, [allLeaves, viewMode])

  const filteredLeaves = useMemo(() => {
    let result = pendingLeaves
    
    // Filter by department
    if (departmentFilter) {
      result = result.filter(leave => leave.department === departmentFilter)
    }
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(leave =>
        leave.fullName?.toLowerCase().includes(searchLower) ||
        leave.reason?.toLowerCase().includes(searchLower) ||
        leave.email?.toLowerCase().includes(searchLower)
      )
    }
    
    return result
  }, [pendingLeaves, search, departmentFilter])


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
    
    // Determine approver type based on view mode, user role, and department
    // For Pentadbiran department: HOD (Encik Shap) should use 'hod' to auto-complete both stages
    // For "My Dept" view with non-HOD users: use 'supervisor'
    // For default view: use the role-based approverType
    let finalApproverType = approverType
    
    // Check if user is HOD (Encik Shap) and viewing their own department
    const isHOD = currentUser?.department?.toLowerCase() === 'pentadbiran'
    
    if (viewMode === 'mydept' && isHOD) {
      // HOD viewing "My Dept" should use 'hod' to auto-complete both supervisor and final review
      finalApproverType = 'hod'
    } else if (viewMode === 'mydept' && !isHOD) {
      // Non-HOD viewing "My Dept" should use 'supervisor'
      finalApproverType = 'supervisor'
    }
    // For default view, keep the role-based approverType (already set)
    
    try {
      const promises = leaveIds.map(id =>
        fetch('/api/leaves', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leaveId: id,
            action,
            reviewerNote,
            approverType: finalApproverType,
            approverId: currentUser.id
          })
        })
      )

      const results = await Promise.all(promises.map(p => p.then(r => r.json()).catch(e => ({ success: false, error: e.message }))))
      
      // Check for errors
      const errors = results.filter(r => !r.success)
      if (errors.length > 0) {
        console.error('❌ Review errors:', errors)
        toast.error(errors[0].error || `Failed to ${action} some leave applications`)
        return
      }
      
      toast.success(`Successfully ${action}d ${leaveIds.length} leave application(s)`)
      setReviewDialog({ open: false, leaveId: null, action: null, bulk: false })
      setReviewerNote('')
      setSelectedLeaves(new Set())
      // Refresh leaves after a short delay to ensure DB is updated
      setTimeout(() => {
        fetchLeaves(currentUser, viewMode === 'all' ? 'all' : viewMode === 'mydept' ? 'mydept' : null)
      }, 300)
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

  const getFilterText = () => {
    if (departmentFilter) {
      return `Department: ${departmentFilter}`
    }
    return null
  }

  const handleExportPDF = () => {
    const filterText = getFilterText()
    
    exportTableToPDF({
      title: 'Leave Review Queue',
      filterText: filterText || undefined,
      columns: [
        { header: 'Intern', accessor: 'fullName', width: 50 },
        { header: 'Department', accessor: 'department', width: 50 },
        { header: 'Type', accessor: (row: any) => row.leaveType || 'Regular', width: 30 },
        { header: 'Start Date', accessor: 'startDate', width: 40 },
        { header: 'End Date', accessor: 'endDate', width: 40 },
        { header: 'Status', accessor: (row: any) => row.status || 'pending', width: 40 },
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
        <style jsx global>{`
          @media print {
            .no-print {
              display: none !important;
            }
            .print-only {
              display: block !important;
            }
            body {
              background: white;
            }
          }
          .print-only {
            display: none;
          }
        `}</style>
        <div className="space-y-3">
          {/* Print-only title */}
          <div className="print-only mb-4">
            <h1 className="text-xl font-bold text-gray-900">Leave Review Queue</h1>
            {getFilterText() && (
              <p className="text-sm text-gray-600 mt-1">{getFilterText()}</p>
            )}
          </div>

          {/* Header */}
          <div className="flex items-center justify-between no-print">
            <div>
              <h1 className="text-xl font-bold text-turquoise-900">Leave Review Queue</h1>
              {viewMode === 'all' && (
                <p className="text-xs text-gray-500 mt-1">Showing all pending leaves (Company Overview)</p>
              )}
              {viewMode === 'mydept' && (
                <p className="text-xs text-gray-500 mt-1">Showing pending leaves from your department</p>
              )}
              {viewMode === 'default' && (
                <p className="text-xs text-gray-500 mt-1">Showing all leave records including past ones</p>
              )}
            </div>
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


          {/* Filters */}
          <Card className="border-turquoise-200 no-print">
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
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-turquoise-500" />
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="h-8 rounded-md border border-turquoise-300 bg-white px-3 py-1 text-sm focus:border-turquoise-500 focus:outline-none focus:ring-2 focus:ring-turquoise-200"
                  >
                    <option value="">All Departments</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* List/Table View */}
          {filteredLeaves.length === 0 ? (
            <Card className="border-turquoise-200">
              <CardContent className="p-6 text-center text-gray-500 text-sm">
                {pendingLeaves.length === 0
                  ? (viewMode === 'default' ? 'No leave applications found' : 'No pending leave applications')
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
                        <th className="text-left p-2 font-semibold text-xs text-turquoise-900">Intern</th>
                        <th className="text-left p-2 font-semibold text-xs text-turquoise-900">Department</th>
                        <th className="text-left p-2 font-semibold text-xs text-turquoise-900">Type</th>
                        <th className="text-left p-2 font-semibold text-xs text-turquoise-900">Start Date</th>
                        <th className="text-left p-2 font-semibold text-xs text-turquoise-900">End Date</th>
                        <th className="text-left p-2 font-semibold text-xs text-turquoise-900">Days</th>
                        <th className="text-left p-2 font-semibold text-xs text-turquoise-900">Status</th>
                        <th className="text-left p-2 font-semibold text-xs text-turquoise-900">Reason</th>
                        <th className="text-left p-2 font-semibold text-xs text-turquoise-900">Applied At</th>
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
                              {getStatusBadge(leave.status || 'pending')}
                            </td>
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
