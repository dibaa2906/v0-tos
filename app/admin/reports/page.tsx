"use client"

import { useState, useEffect } from 'react'
import { AdminGuard } from '@/components/auth-guard'
import { AdminLayout } from '@/components/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Printer, TrendingUp, TrendingDown, Clock, UserX, Calendar } from 'lucide-react'
import { exportTableToPDF, exportTableToCSV } from '@/lib/pdf-export'
import { DEPARTMENTS, getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [totals, setTotals] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [department, setDepartment] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    getCurrentUser().then(user => setCurrentUser(user)).catch(console.error)
  }, [])

  useEffect(() => {
    fetchReports()
  }, [month, department])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ month })
      if (department) params.append('department', department)
      
      const res = await fetch(`/api/reports?${params}`)
      const data = await res.json()
      
      if (data.success) {
        setReports(data.reports || [])
        setTotals(data.totals || {})
      } else {
        toast.error(data.error || 'Failed to fetch reports')
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = () => {
    exportTableToPDF({
      title: `Attendance Report - ${month}${department ? ` - ${department}` : ''}`,
      columns: [
        { header: 'Name', accessor: 'fullName', width: 50 },
        { header: 'Department', accessor: 'department', width: 60 },
        { header: 'Total Days', accessor: 'totalDays', width: 30 },
        { header: 'On Time', accessor: 'onTimeCount', width: 30 },
        { header: 'Late', accessor: 'lateCount', width: 30 },
        { header: 'Absent', accessor: 'absentCount', width: 30 },
        { header: 'Leave', accessor: 'leaveCount', width: 30 },
        { header: 'Total Hours', accessor: (row: any) => row.totalHours ? row.totalHours.toFixed(2) : '0.00', width: 40 }
      ],
      data: reports,
      filename: `attendance-report-${month}-${new Date().toISOString().split('T')[0]}.pdf`,
      userName: currentUser?.fullName,
      userDepartment: currentUser?.department
    })
  }

  const handleExportCSV = () => {
    exportTableToCSV({
      title: `Attendance Report - ${month}`,
      columns: [
        { header: 'Name', accessor: 'fullName' },
        { header: 'Department', accessor: 'department' },
        { header: 'Total Days', accessor: 'totalDays' },
        { header: 'On Time', accessor: 'onTimeCount' },
        { header: 'Late', accessor: 'lateCount' },
        { header: 'Absent', accessor: 'absentCount' },
        { header: 'Leave', accessor: 'leaveCount' },
        { header: 'Total Hours', accessor: (row: any) => row.totalHours ? row.totalHours.toFixed(2) : '0.00' }
      ],
      data: reports,
      filename: `attendance-report-${month}-${new Date().toISOString().split('T')[0]}.csv`,
      userName: currentUser?.fullName,
      userDepartment: currentUser?.department
    })
  }

  const handlePrint = () => {
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
  <title>Attendance Report - ${month}</title>
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
    .document-info {
      display: flex;
      justify-content: space-between;
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
          <p><span class="label">Name:</span> ${currentUser?.fullName || 'N/A'}</p>
          <p><span class="label">Department:</span> ${currentUser?.department || 'N/A'}</p>
        </div>
        <div class="right">
          <p><span class="label">Printed:</span> ${printDate}</p>
          <p><span class="label">Total Records:</span> ${reports.length}</p>
        </div>
      </div>
    </div>

    <div class="document-title">Attendance Report - ${month}${department ? ` - ${department}` : ''}</div>

    <table>
      <thead>
        <tr>
          <th style="width: 15%;">Name</th>
          <th style="width: 15%;">Department</th>
          <th style="width: 10%;">Total Days</th>
          <th style="width: 10%;">On Time</th>
          <th style="width: 10%;">Late</th>
          <th style="width: 10%;">Absent</th>
          <th style="width: 10%;">Leave</th>
          <th style="width: 10%;">Total Hours</th>
        </tr>
      </thead>
      <tbody>
        ${reports.length === 0 ? '<tr><td colspan="8" style="text-align: center; padding: 20px;">No records found</td></tr>' : reports.map(report => `
          <tr>
            <td>${report.fullName || '-'}</td>
            <td>${report.department || '-'}</td>
            <td style="text-align: center;">${report.totalDays || 0}</td>
            <td style="text-align: center;">${report.onTimeCount || 0}</td>
            <td style="text-align: center;">${report.lateCount || 0}</td>
            <td style="text-align: center;">${report.absentCount || 0}</td>
            <td style="text-align: center;">${report.leaveCount || 0}</td>
            <td style="text-align: center;">${report.totalHours ? report.totalHours.toFixed(2) : '0.00'}</td>
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

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-turquoise-900">Attendance Reports</h1>
            <div className="flex gap-2">
              <Button onClick={handleExportPDF} variant="outline" size="sm" className="border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button onClick={handleExportCSV} variant="outline" size="sm" className="border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50">
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button onClick={handlePrint} variant="outline" size="sm" className="border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="border-turquoise-200">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Month</label>
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="h-10 rounded-md border border-turquoise-300 bg-white px-3 py-2 text-sm focus:border-turquoise-500 focus:outline-none focus:ring-2 focus:ring-turquoise-200"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="h-10 rounded-md border border-turquoise-300 bg-white px-3 py-2 text-sm focus:border-turquoise-500 focus:outline-none focus:ring-2 focus:ring-turquoise-200"
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

          {/* Summary Cards */}
          {totals && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-turquoise-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Late</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    <span className="text-2xl font-bold text-gray-900">{totals.totalLate || 0}</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-turquoise-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Absent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <UserX className="h-5 w-5 text-gray-500" />
                    <span className="text-2xl font-bold text-gray-900">{totals.totalAbsent || 0}</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-turquoise-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-turquoise-600" />
                    <span className="text-2xl font-bold text-gray-900">
                      {totals.totalHours ? totals.totalHours.toFixed(2) : '0.00'}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-turquoise-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-turquoise-600" />
                    <span className="text-2xl font-bold text-gray-900">{reports.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reports Table */}
          <Card className="border-turquoise-200">
            <CardHeader>
              <CardTitle className="text-turquoise-900">Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12 text-gray-500">Loading reports...</div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No attendance data found for the selected period</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-turquoise-50 border-b border-turquoise-200">
                        <th className="text-left p-4 font-semibold text-sm text-turquoise-900">Name</th>
                        <th className="text-left p-4 font-semibold text-sm text-turquoise-900">Department</th>
                        <th className="text-left p-4 font-semibold text-sm text-turquoise-900">Total Days</th>
                        <th className="text-left p-4 font-semibold text-sm text-turquoise-900">On Time</th>
                        <th className="text-left p-4 font-semibold text-sm text-turquoise-900">Late</th>
                        <th className="text-left p-4 font-semibold text-sm text-turquoise-900">Absent</th>
                        <th className="text-left p-4 font-semibold text-sm text-turquoise-900">Leave</th>
                        <th className="text-left p-4 font-semibold text-sm text-turquoise-900">Total Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report, idx) => (
                        <tr key={idx} className="border-b border-turquoise-100 hover:bg-turquoise-50">
                          <td className="p-4 font-medium text-gray-900">{report.fullName || '-'}</td>
                          <td className="p-4 text-sm text-gray-700">{report.department || '-'}</td>
                          <td className="p-4 text-sm">{report.totalDays || 0}</td>
                          <td className="p-4 text-sm text-green-600 font-medium">{report.onTimeCount || 0}</td>
                          <td className="p-4 text-sm text-red-600 font-medium">{report.lateCount || 0}</td>
                          <td className="p-4 text-sm text-gray-600 font-medium">{report.absentCount || 0}</td>
                          <td className="p-4 text-sm text-blue-600 font-medium">{report.leaveCount || 0}</td>
                          <td className="p-4 text-sm font-medium text-turquoise-700">
                            {report.totalHours ? report.totalHours.toFixed(2) : '0.00'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminGuard>
  )
}
