"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminGuard } from '@/components/auth-guard'
import { AdminLayout } from '@/components/admin-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Download, Printer, MapPin, Camera, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react'
import { exportTableToPDF, exportTableToCSV } from '@/lib/pdf-export'
import { toast } from 'sonner'

export default function AdminInternDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [intern, setIntern] = useState<any>(null)
  const [attendance, setAttendance] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [leaves, setLeaves] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('attendance')
  const [photoDialog, setPhotoDialog] = useState<{ open: boolean; image: string | null; type: string }>({ open: false, image: null, type: '' })

  useEffect(() => {
    if (id) {
      fetchData()
    }
  }, [id])

  const fetchData = async () => {
    try {
      const [internRes, attendanceRes, logsRes, leavesRes] = await Promise.all([
        fetch(`/api/auth/interns?id=${id}`).catch(() => ({ json: () => ({ intern: null }) })),
        fetch(`/api/attendance?userId=${id}`).catch(() => ({ json: () => ({ attendance: [] }) })),
        fetch(`/api/logs?userId=${id}`).catch(() => ({ json: () => ({ logs: [] }) })),
        fetch(`/api/leaves?userId=${id}`).catch(() => ({ json: () => ({ leaves: [] }) }))
      ])

      const internData = await internRes.json()
      const attendanceData = await attendanceRes.json()
      const logsData = await logsRes.json()
      const leavesData = await leavesRes.json()

      setIntern(internData.intern || null)
      setAttendance(attendanceData.attendance || attendanceData.records || [])
      setLogs(logsData.logs || [])
      setLeaves(leavesData.leaves || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load intern data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string; className: string }> = {
      'on_time': { variant: 'default', label: 'On Time', className: 'bg-turquoise-500 text-white' },
      'late': { variant: 'destructive', label: 'Late', className: 'bg-red-500 text-white' },
      'absent': { variant: 'secondary', label: 'Absent', className: 'bg-gray-300 text-gray-700' },
      'leave': { variant: 'outline', label: 'Leave', className: 'bg-blue-100 text-blue-700' }
    }
    const config = statusMap[status] || { variant: 'secondary', label: status, className: 'bg-gray-300 text-gray-700' }
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getLeaveStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string; className: string }> = {
      'pending': { variant: 'secondary', label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
      'approved_hod': { variant: 'default', label: 'Approved', className: 'bg-green-500 text-white' },
      'approved_supervisor': { variant: 'default', label: 'Approved (Supervisor)', className: 'bg-green-400 text-white' },
      'rejected': { variant: 'destructive', label: 'Rejected', className: 'bg-red-500 text-white' }
    }
    const config = statusMap[status] || { variant: 'secondary', label: status, className: 'bg-gray-300 text-gray-700' }
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const handleExportPDF = (type: string) => {
    let columns: any[] = []
    let data: any[] = []
    let title = ''

    switch (type) {
      case 'attendance':
        title = `Attendance Report - ${intern?.fullName || 'Intern'}`
        columns = [
          { header: 'Date', accessor: 'date', width: 40 },
          { header: 'Time In', accessor: 'clockInTime', width: 40 },
          { header: 'Time Out', accessor: 'clockOutTime', width: 40 },
          { header: 'Status', accessor: (row: any) => row.status || 'N/A', width: 30 }
        ]
        data = attendance
        break
      case 'logs':
        title = `Volume Logs - ${intern?.fullName || 'Intern'}`
        columns = [
          { header: 'Date', accessor: 'date', width: 40 },
          { 
            header: 'Content', 
            accessor: (row: any) => {
              if (!row.content) return '-'
              const lines = row.content.split('\n').filter((line: string) => line.trim())
              return lines.map((line: string) => `- ${line.trim()}`).join('\n')
            }, 
            width: 120 
          }
        ]
        data = logs
        break
      case 'leaves':
        title = `Leave Applications - ${intern?.fullName || 'Intern'}`
        columns = [
          { header: 'Type', accessor: () => 'Leave', width: 30 },
          { header: 'Start Date', accessor: 'startDate', width: 40 },
          { header: 'End Date', accessor: 'endDate', width: 40 },
          { header: 'Reason', accessor: 'reason', width: 80 },
          { header: 'Status', accessor: (row: any) => row.status || 'N/A', width: 30 },
          { header: 'Reviewer Note', accessor: (row: any) => row.reviewerNote || '-', width: 60 }
        ]
        data = leaves
        break
    }

    exportTableToPDF({
      title,
      columns,
      data,
      filename: `${type}-${intern?.fullName || 'intern'}-${new Date().toISOString().split('T')[0]}.pdf`,
      userName: intern?.fullName,
      userDepartment: intern?.department
    })
  }

  const handleExportCSV = (type: string) => {
    let columns: any[] = []
    let data: any[] = []
    let filename = ''

    switch (type) {
      case 'attendance':
        filename = `attendance-${intern?.fullName || 'intern'}-${new Date().toISOString().split('T')[0]}.csv`
        columns = [
          { header: 'Date', accessor: 'date' },
          { header: 'Time In', accessor: 'clockInTime' },
          { header: 'Time Out', accessor: 'clockOutTime' },
          { header: 'Status', accessor: (row: any) => row.status || 'N/A' }
        ]
        data = attendance
        break
      case 'logs':
        filename = `logs-${intern?.fullName || 'intern'}-${new Date().toISOString().split('T')[0]}.csv`
        columns = [
          { header: 'Date', accessor: 'date' },
          { 
            header: 'Content', 
            accessor: (row: any) => {
              if (!row.content) return '-'
              const lines = row.content.split('\n').filter((line: string) => line.trim())
              return lines.map((line: string) => `- ${line.trim()}`).join('\n')
            }
          }
        ]
        data = logs
        break
      case 'leaves':
        filename = `leaves-${intern?.fullName || 'intern'}-${new Date().toISOString().split('T')[0]}.csv`
        columns = [
          { header: 'Type', accessor: () => 'Leave' },
          { header: 'Start Date', accessor: 'startDate' },
          { header: 'End Date', accessor: 'endDate' },
          { header: 'Reason', accessor: 'reason' },
          { header: 'Status', accessor: (row: any) => row.status || 'N/A' },
          { header: 'Reviewer Note', accessor: (row: any) => row.reviewerNote || '-' }
        ]
        data = leaves
        break
    }

    exportTableToCSV({
      title: '',
      columns,
      data,
      filename,
      userName: intern?.fullName,
      userDepartment: intern?.department
    })
  }

  const handlePrint = (type: string) => {
    let title = ''
    let columns: string[] = []
    let columnWidths: string[] = []
    let data: any[] = []

    switch (type) {
      case 'attendance':
        title = 'Attendance Report'
        columns = ['Date', 'Time In', 'Time Out', 'Status']
        columnWidths = ['25%', '20%', '20%', '35%']
        data = attendance.map(a => ({
          'Date': a.date ? new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-',
          'Time In': a.clockInTime || '-',
          'Time Out': a.clockOutTime || '-',
          'Status': a.status || 'N/A'
        }))
        break
      case 'logs':
        title = 'Volume Logs'
        columns = ['Date', 'Content']
        columnWidths = ['20%', '80%']
        data = logs.map(l => ({
          'Date': l.date ? new Date(l.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-',
          'Content': l.content ? l.content.split('\n').filter((line: string) => line.trim()).map((line: string) => `• ${line.trim()}`).join('<br>') : 'No content'
        }))
        break
      case 'leaves':
        title = 'Leave Applications'
        columns = ['Type', 'Start Date', 'End Date', 'Reason', 'Status', 'Reviewer Note']
        columnWidths = ['10%', '15%', '15%', '25%', '15%', '20%']
        data = leaves.map(l => ({
          'Type': 'Leave',
          'Start Date': l.startDate ? new Date(l.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-',
          'End Date': l.endDate ? new Date(l.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-',
          'Reason': l.reason || '-',
          'Status': l.status || 'N/A',
          'Reviewer Note': l.reviewerNote || '-'
        }))
        break
    }

    const printDate = new Date().toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })

    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <title>${title} - ${intern?.fullName || 'Intern'}</title>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Times New Roman', serif; 
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      padding: 0;
    }
    .document {
      max-width: 210mm;
      margin: 0 auto;
      padding: 10mm 15mm;
    }
    .header-section {
      border-bottom: 2px solid #000;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .company-info {
      text-align: center;
      margin-bottom: 8px;
    }
    .company-info h2 {
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 3px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .company-info p {
      font-size: 9pt;
      color: #333;
    }
    .document-info {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      font-size: 10pt;
    }
    .document-info .left, .document-info .right {
      width: 48%;
    }
    .document-info .label {
      font-weight: bold;
      display: inline-block;
      min-width: 80px;
    }
    .document-title {
      text-align: center;
      font-size: 16pt;
      font-weight: bold;
      margin: 12px 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      page-break-inside: auto;
    }
    thead {
      display: table-header-group;
    }
    tbody {
      display: table-row-group;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    th, td {
      padding: 10px 12px;
      text-align: left;
      border: 1px solid #000;
      vertical-align: top;
    }
    th {
      background-color: #f5f5f5;
      font-weight: bold;
      text-align: center;
      font-size: 11pt;
      text-transform: uppercase;
    }
    td {
      font-size: 11pt;
    }
    .content-cell {
      white-space: pre-wrap;
      line-height: 1.5;
    }
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #000;
      font-size: 10pt;
      text-align: center;
      color: #666;
    }
      @media print {
      body { margin: 0; padding: 0; }
      .document {
        padding: 8mm 10mm;
      }
      @page {
        size: A4;
        margin: 10mm 10mm;
      }
      .no-print { display: none !important; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
      thead { display: table-header-group; }
      tfoot { display: table-footer-group; }
    }
  </style>
</head>
<body>
  <div class="document">
    <div class="header-section">
      <div class="document-info">
        <div class="left">
          <p><span class="label">Name:</span> ${intern?.fullName || 'N/A'}</p>
          <p><span class="label">Department:</span> ${intern?.department || 'N/A'}</p>
        </div>
        <div class="right">
          <p><span class="label">Printed:</span> ${printDate}</p>
          <p><span class="label">Total Records:</span> ${data.length}</p>
        </div>
      </div>
    </div>

    <div class="document-title">${title}</div>

    <table>
      <thead>
        <tr>
          ${columns.map((col, idx) => {
            const isCenter = col === 'Date' || col === 'Time In' || col === 'Time Out' || col === 'Status' || col === 'Type'
            const styles = `width: ${columnWidths[idx] || 'auto'};${isCenter ? ' text-align: center;' : ''}`
            return `<th style="${styles}">${col}</th>`
          }).join('')}
        </tr>
      </thead>
      <tbody>
        ${data.length === 0 ? `<tr><td colspan="${columns.length}" style="text-align: center; padding: 20px;">No data found</td></tr>` : data.map(row => `
          <tr>
            ${columns.map((col, idx) => {
              const value = row[col] || '-'
              const isCenter = col === 'Date' || col === 'Time In' || col === 'Time Out' || col === 'Status' || col === 'Type'
              return `<td${col === 'Content' || col === 'Reason' || col === 'Reviewer Note' ? ' class="content-cell"' : ''}${isCenter ? ' style="text-align: center;"' : ''}>${value}</td>`
            }).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="footer">
      <p>This document was generated electronically on ${printDate}</p>
    </div>
  </div>
</body>
</html>
    `
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  }

  if (loading) {
    return (
      <AdminGuard>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">Loading intern profile...</div>
        </AdminLayout>
      </AdminGuard>
    )
  }

  if (!intern) {
    return (
      <AdminGuard>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-500 mb-4">Intern not found</p>
              <Button onClick={() => router.push('/admin/interns')}>Back to Interns</Button>
            </div>
          </div>
        </AdminLayout>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/admin/interns')}
                className="text-turquoise-700 hover:bg-turquoise-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-3xl font-bold text-turquoise-900">Intern Details</h1>
            </div>
          </div>

          {/* Profile Card */}
          <Card className="border-turquoise-200">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="h-24 w-24 border-4 border-turquoise-200">
                  <AvatarImage src={intern.profilePhoto || '/placeholder-user.jpg'} />
                  <AvatarFallback className="text-2xl bg-turquoise-100 text-turquoise-700">
                    {intern.fullName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-turquoise-900">{intern.fullName}</h2>
                      <p className="text-gray-600">{intern.email}</p>
                      <p className="text-sm text-turquoise-600">{intern.department}</p>
                    </div>
                    <div className="flex gap-2">
                      {intern.isAdmin && <Badge className="bg-blue-500 text-white">Admin</Badge>}
                      <Badge className={intern.isActive !== 0 && intern.isActive !== false ? 'bg-turquoise-500 text-white' : 'bg-gray-300 text-gray-700'}>
                        {intern.isActive !== 0 && intern.isActive !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Username:</span>
                      <span className="ml-2 font-medium">{intern.username}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Address:</span>
                      <span className="ml-2 font-medium">{intern.address || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Emergency Contact:</span>
                      <span className="ml-2 font-medium">
                        {intern.emergencyContactName || 'N/A'} / {intern.emergencyContactPhone || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Joined:</span>
                      <span className="ml-2 font-medium">
                        {intern.createdAt ? new Date(intern.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 bg-turquoise-50">
              <TabsTrigger value="attendance" className="data-[state=active]:bg-turquoise-500 data-[state=active]:text-white">
                Attendance
              </TabsTrigger>
              <TabsTrigger value="logs" className="data-[state=active]:bg-turquoise-500 data-[state=active]:text-white">
                Volume Logs
              </TabsTrigger>
              <TabsTrigger value="leaves" className="data-[state=active]:bg-turquoise-500 data-[state=active]:text-white">
                Leave
              </TabsTrigger>
            </TabsList>

            {/* Attendance Tab */}
            <TabsContent value="attendance" className="space-y-4">
              <Card className="border-turquoise-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-turquoise-900">Attendance History</CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleExportPDF('attendance')}
                        className="border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleExportCSV('attendance')}
                        className="border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        CSV
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePrint('attendance')}
                        className="border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-turquoise-50 border-b border-turquoise-200">
                          <th className="text-left p-3 font-semibold text-sm text-turquoise-900">Date</th>
                          <th className="text-left p-3 font-semibold text-sm text-turquoise-900">Time In</th>
                          <th className="text-left p-3 font-semibold text-sm text-turquoise-900">Time Out</th>
                          <th className="text-left p-3 font-semibold text-sm text-turquoise-900">Status</th>
                          <th className="text-left p-3 font-semibold text-sm text-turquoise-900">Photo Check-ins</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-gray-500">
                              No attendance records found
                            </td>
                          </tr>
                        ) : (
                          attendance.map((record, idx) => (
                            <tr key={idx} className="border-b border-turquoise-100 hover:bg-turquoise-50">
                              <td className="p-3">{record.date ? new Date(record.date).toLocaleDateString() : '-'}</td>
                              <td className="p-3">{record.clockInTime || '-'}</td>
                              <td className="p-3">{record.clockOutTime || '-'}</td>
                              <td className="p-3">{getStatusBadge(record.status || 'absent')}</td>
                              <td className="p-3">
                                <div className="space-y-2">
                                  {record.clockInImage && (
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setPhotoDialog({ open: true, image: record.clockInImage, type: 'IN' })}
                                        className="h-7 text-xs border border-turquoise-200 hover:bg-turquoise-50"
                                      >
                                        <Camera className="h-3 w-3 mr-1" />
                                        IN
                                      </Button>
                                      <span className="text-xs text-gray-500">{record.clockInTime || '-'}</span>
                                      {(record.clockInLatitude && record.clockInLongitude) && (
                                        <Badge variant="outline" className="text-xs border-turquoise-300">
                                          <MapPin className="h-3 w-3 mr-1" />
                                          Location
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                  {record.clockOutImage && (
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setPhotoDialog({ open: true, image: record.clockOutImage, type: 'OUT' })}
                                        className="h-7 text-xs border border-turquoise-200 hover:bg-turquoise-50"
                                      >
                                        <Camera className="h-3 w-3 mr-1" />
                                        OUT
                                      </Button>
                                      <span className="text-xs text-gray-500">{record.clockOutTime || '-'}</span>
                                      {(record.clockOutLatitude && record.clockOutLongitude) && (
                                        <Badge variant="outline" className="text-xs border-turquoise-300">
                                          <MapPin className="h-3 w-3 mr-1" />
                                          Location
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Volume Logs Tab */}
            <TabsContent value="logs" className="space-y-4">
              <Card className="border-turquoise-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-turquoise-900">Volume Logs</CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleExportPDF('logs')}
                        className="border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleExportCSV('logs')}
                        className="border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        CSV
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePrint('logs')}
                        className="border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-turquoise-50 border-b border-turquoise-200">
                          <th className="text-left p-3 font-semibold text-sm text-turquoise-900">Date</th>
                          <th className="text-left p-3 font-semibold text-sm text-turquoise-900">Content</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.length === 0 ? (
                          <tr>
                            <td colSpan={2} className="text-center py-8 text-gray-500">
                              No volume logs found
                            </td>
                          </tr>
                        ) : (
                          logs.map((log, idx) => {
                            const formatContent = (text: string) => {
                              if (!text) return '-'
                              const lines = text.split('\n').filter(line => line.trim())
                              return (
                                <ul className="list-none space-y-1">
                                  {lines.map((line, lineIdx) => (
                                    <li key={lineIdx} className="flex items-start">
                                      <span className="mr-2">-</span>
                                      <span>{line.trim()}</span>
                                    </li>
                                  ))}
                                </ul>
                              )
                            }
                            return (
                              <tr key={idx} className="border-b border-turquoise-100 hover:bg-turquoise-50">
                                <td className="p-3">{log.date ? new Date(log.date).toLocaleDateString() : '-'}</td>
                                <td className="p-3">{formatContent(log.content || '')}</td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Leave Tab */}
            <TabsContent value="leaves" className="space-y-4">
              <Card className="border-turquoise-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-turquoise-900">Leave Applications</CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleExportPDF('leaves')}
                        className="border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleExportCSV('leaves')}
                        className="border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        CSV
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePrint('leaves')}
                        className="border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-turquoise-50 border-b border-turquoise-200">
                          <th className="text-left p-3 font-semibold text-sm text-turquoise-900">Type</th>
                          <th className="text-left p-3 font-semibold text-sm text-turquoise-900">Start Date</th>
                          <th className="text-left p-3 font-semibold text-sm text-turquoise-900">End Date</th>
                          <th className="text-left p-3 font-semibold text-sm text-turquoise-900">Reason</th>
                          <th className="text-left p-3 font-semibold text-sm text-turquoise-900">Status</th>
                          <th className="text-left p-3 font-semibold text-sm text-turquoise-900">Reviewer Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaves.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-gray-500">
                              No leave applications found
                            </td>
                          </tr>
                        ) : (
                          leaves.map((leave, idx) => (
                            <tr key={idx} className="border-b border-turquoise-100 hover:bg-turquoise-50">
                              <td className="p-3">
                                <Badge variant="outline" className="border-turquoise-300">Leave</Badge>
                              </td>
                              <td className="p-3">{leave.startDate ? new Date(leave.startDate).toLocaleDateString() : '-'}</td>
                              <td className="p-3">{leave.endDate ? new Date(leave.endDate).toLocaleDateString() : '-'}</td>
                              <td className="p-3">{leave.reason || '-'}</td>
                              <td className="p-3">{getLeaveStatusBadge(leave.status || 'pending')}</td>
                              <td className="p-3 text-sm text-gray-600">{leave.reviewerNote || '-'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Photo Dialog */}
        <Dialog open={photoDialog.open} onOpenChange={(open) => setPhotoDialog({ open, image: null, type: '' })}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Check-in Photo - {photoDialog.type}</DialogTitle>
              <DialogDescription>
                {photoDialog.type === 'IN' ? 'Clock In' : 'Clock Out'} photo verification
              </DialogDescription>
            </DialogHeader>
            {photoDialog.image && (
              <div className="flex justify-center">
                <img
                  src={photoDialog.image}
                  alt={`Check-in photo ${photoDialog.type}`}
                  className="max-w-full h-auto rounded-lg border border-turquoise-200"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminGuard>
  )
}
