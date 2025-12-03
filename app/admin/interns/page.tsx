"use client"

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AdminGuard } from '@/components/auth-guard'
import { AdminLayout } from '@/components/admin-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Search, ChevronLeft, ChevronRight, Download, Printer, ArrowUpDown } from 'lucide-react'
import { exportTableToPDF, exportTableToCSV } from '@/lib/pdf-export'
import { DEPARTMENTS, getCurrentUser } from '@/lib/auth'

export default function InternsManagementPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [interns, setInterns] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortField, setSortField] = useState<string>('fullName')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'all' | 'mine'>('mine')
  const itemsPerPage = 10

  useEffect(() => {
    fetchInterns()
  }, [])

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        setCurrentUser(user)
        if (!user?.department) {
          setViewMode('all')
        }
      })
      .catch(console.error)
  }, [])

  const forcedView = searchParams?.get('view')

  useEffect(() => {
    if (forcedView === 'mine' || forcedView === 'all') {
      if (forcedView === 'mine' && !currentUser?.department) {
        setViewMode('all')
      } else {
        setViewMode(forcedView)
      }
    }
  }, [forcedView, currentUser?.department])

  const fetchInterns = async () => {
    try {
      const res = await fetch('/api/auth/interns')
      const data = await res.json()
      if (data.interns) {
        setInterns(data.interns)
      }
    } catch (error) {
      console.error('Error fetching interns:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSorted = useMemo(() => {
    let filtered = interns.filter(intern => {
      const searchLower = search.toLowerCase()
      const matchesSearch = !search || 
        intern.fullName?.toLowerCase().includes(searchLower) ||
        intern.email?.toLowerCase().includes(searchLower) ||
        intern.phoneNumber?.toString().includes(search)
      
      const matchesDept = !departmentFilter || intern.department === departmentFilter
      const matchesStatus = !statusFilter || 
        (statusFilter === 'active' && (intern.isActive !== 0 && intern.isActive !== false)) ||
        (statusFilter === 'inactive' && (intern.isActive === 0 || intern.isActive === false))
      
      return matchesSearch && matchesDept && matchesStatus
    })

    if (viewMode === 'mine' && currentUser?.department) {
      const normalized = currentUser.department.trim().toLowerCase()
      filtered = filtered.filter(intern => (intern.department || '').trim().toLowerCase() === normalized)
    }

    filtered.sort((a, b) => {
      let aVal: any = a[sortField] || ''
      let bVal: any = b[sortField] || ''
      
      if (sortField === 'fullName') {
        aVal = (a.fullName || '').toLowerCase()
        bVal = (b.fullName || '').toLowerCase()
      }
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = (bVal || '').toLowerCase()
      }
      
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [interns, search, departmentFilter, statusFilter, sortField, sortOrder, viewMode, currentUser?.department])

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredAndSorted.slice(start, start + itemsPerPage)
  }, [filteredAndSorted, currentPage])

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage)

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleExportPDF = () => {
    exportTableToPDF({
      title: 'Interns Management Report',
      columns: [
        { header: 'Name', accessor: 'fullName', width: 60 },
        { header: 'Email', accessor: 'email', width: 80 },
        { header: 'Department', accessor: 'department', width: 60 },
        { header: 'Status', accessor: (row) => row.isActive !== 0 && row.isActive !== false ? 'Active' : 'Inactive', width: 30 },
        { header: 'Joined', accessor: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-', width: 40 }
      ],
      data: filteredAndSorted,
      filename: `interns-${new Date().toISOString().split('T')[0]}.pdf`,
      userName: currentUser?.fullName,
      userDepartment: currentUser?.department
    })
  }

  const handleExportCSV = () => {
    exportTableToCSV({
      title: 'Interns Management Report',
      columns: [
        { header: 'Name', accessor: 'fullName' },
        { header: 'Email', accessor: 'email' },
        { header: 'Department', accessor: 'department' },
        { header: 'Status', accessor: (row) => row.isActive !== 0 && row.isActive !== false ? 'Active' : 'Inactive' },
        { header: 'Joined', accessor: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-' }
      ],
      data: filteredAndSorted,
      filename: `interns-${new Date().toISOString().split('T')[0]}.csv`,
      userName: currentUser?.fullName,
      userDepartment: currentUser?.department
    })
  }

  if (loading) {
    return (
      <AdminGuard>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-gray-600">Loading interns...</p>
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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-turquoise-900">Interns Management</h1>
              {currentUser?.department && (
                <p className="text-sm text-gray-600 mt-1">
                  Viewing as <span className="font-semibold">{currentUser.fullName}</span> ({currentUser.department})
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExportPDF} variant="outline" size="sm" className="border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button onClick={handleExportCSV} variant="outline" size="sm" className="border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50">
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button onClick={() => window.print()} variant="outline" size="sm" className="border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>

          {/* Filters */}
          {forcedView === 'mine' ? null : (
            <Card className="border-turquoise-200">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-center">
                  {!forcedView && (
                    <div className="flex gap-2">
                      <Button
                        variant={viewMode === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => { setViewMode('all'); setCurrentPage(1) }}
                      >
                        All Interns
                      </Button>
                      <Button
                        variant={viewMode === 'mine' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => { setViewMode('mine'); setCurrentPage(1) }}
                        disabled={!currentUser?.department}
                      >
                        My Interns
                      </Button>
                    </div>
                  )}

                  {viewMode === 'all' && (
                    <div className="flex-1 min-w-[220px]">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-turquoise-500" />
                        <Input
                          placeholder="Search by name, email, or phone..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="pl-10 border-turquoise-300 focus:border-turquoise-500"
                        />
                      </div>
                    </div>
                  )}
                  
                  <select
                    value={departmentFilter}
                    onChange={(e) => { setDepartmentFilter(e.target.value); setCurrentPage(1) }}
                    className="h-10 rounded-md border border-turquoise-300 bg-white px-3 py-2 text-sm focus:border-turquoise-500 focus:outline-none focus:ring-2 focus:ring-turquoise-200"
                  >
                    <option value="">All Departments</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
                    className="h-10 rounded-md border border-turquoise-300 bg-white px-3 py-2 text-sm focus:border-turquoise-500 focus:outline-none focus:ring-2 focus:ring-turquoise-200"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                {viewMode === 'mine' && !currentUser?.department && (
                  <p className="text-xs text-red-500 mt-2">Add a department to your profile to use "My Interns" view.</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Table */}
          <Card className="border-turquoise-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-turquoise-50 border-b border-turquoise-200">
                      <th className="text-left p-4 font-semibold text-sm text-turquoise-900">Profile</th>
                      <th 
                        className="text-left p-4 font-semibold text-sm text-turquoise-900 cursor-pointer hover:bg-turquoise-100 transition-colors"
                        onClick={() => handleSort('fullName')}
                      >
                        <div className="flex items-center gap-2">
                          Name
                          <ArrowUpDown className="h-4 w-4 text-turquoise-600" />
                        </div>
                      </th>
                      <th className="text-left p-4 font-semibold text-sm text-turquoise-900">Email</th>
                      <th 
                        className="text-left p-4 font-semibold text-sm text-turquoise-900 cursor-pointer hover:bg-turquoise-100 transition-colors"
                        onClick={() => handleSort('department')}
                      >
                        <div className="flex items-center gap-2">
                          Department
                          <ArrowUpDown className="h-4 w-4 text-turquoise-600" />
                        </div>
                      </th>
                      <th className="text-left p-4 font-semibold text-sm text-turquoise-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-gray-500">
                          No interns found
                        </td>
                      </tr>
                    ) : (
                      paginated.map((intern) => (
                        <tr
                          key={intern.id}
                          className="border-b border-turquoise-100 hover:bg-turquoise-50 cursor-pointer transition-colors"
                          onClick={() => router.push(`/admin/interns/${intern.id}`)}
                        >
                          <td className="p-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={intern.profilePhoto || '/placeholder-user.jpg'} />
                              <AvatarFallback className="bg-turquoise-100 text-turquoise-700">
                                {intern.fullName?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                          </td>
                          <td className="p-4 font-medium text-gray-900">{intern.fullName || '-'}</td>
                          <td className="p-4 text-sm text-gray-600">{intern.email || '-'}</td>
                          <td className="p-4 text-sm text-gray-700">{intern.department || '-'}</td>
                          <td className="p-4">
                            <Badge 
                              variant={intern.isActive !== 0 && intern.isActive !== false ? 'default' : 'secondary'}
                              className={intern.isActive !== 0 && intern.isActive !== false 
                                ? 'bg-turquoise-500 text-white' 
                                : 'bg-gray-200 text-gray-700'}
                            >
                              {intern.isActive !== 0 && intern.isActive !== false ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-turquoise-200 bg-turquoise-50">
                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSorted.length)} of {filteredAndSorted.length} interns
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let page: number
                        if (totalPages <= 5) {
                          page = i + 1
                        } else if (currentPage <= 3) {
                          page = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i
                        } else {
                          page = currentPage - 2 + i
                        }
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={
                              currentPage === page
                                ? 'bg-turquoise-600 text-white hover:bg-turquoise-700'
                                : 'border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50'
                            }
                          >
                            {page}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminGuard>
  )
}
