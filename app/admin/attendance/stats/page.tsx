"use client"

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AdminGuard } from '@/components/auth-guard'
import { AdminLayout } from '@/components/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid, Cell } from 'recharts'

export default function AttendanceStatsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalActive: 0,
    onTime: 0,
    late: 0,
    absent: 0
  })
  const [departmentStats, setDepartmentStats] = useState<any[]>([])

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7)
      const [internsRes, reportsRes] = await Promise.all([
        fetch('/api/auth/interns'),
        fetch(`/api/reports?month=${currentMonth}`)
      ])

      const internsData = await internsRes.json()
      const reportsData = await reportsRes.json()

      const activeInterns = (internsData.interns || []).filter((i: any) => 
        i.isActive !== 0 && i.isActive !== false && i.isActive !== '0'
      )

      const totals = reportsData.totals || {}
      
      setStats({
        totalActive: activeInterns.length,
        onTime: totals.totalOnTime || 0,
        late: totals.totalLate || 0,
        absent: totals.totalAbsent || 0
      })

      // Group by department
      const deptMap = new Map()
      activeInterns.forEach((intern: any) => {
        const dept = intern.department || 'Unknown'
        if (!deptMap.has(dept)) {
          deptMap.set(dept, { department: dept, count: 0, onTime: 0, late: 0, absent: 0 })
        }
        deptMap.get(dept).count++
      })

      setDepartmentStats(Array.from(deptMap.values()))
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = useMemo(() => {
    return [
      { name: 'On-Time', value: stats.onTime, fill: '#10b981' },
      { name: 'Late', value: stats.late, fill: '#f59e0b' },
      { name: 'Absent', value: stats.absent, fill: '#ef4444' }
    ]
  }, [stats])

  const flowData = useMemo(() => {
    const total = stats.onTime + stats.late + stats.absent
    return {
      totalActive: stats.totalActive,
      totalRecords: total,
      onTimePercent: total > 0 ? Math.round((stats.onTime / total) * 100) : 0,
      latePercent: total > 0 ? Math.round((stats.late / total) * 100) : 0,
      absentPercent: total > 0 ? Math.round((stats.absent / total) * 100) : 0
    }
  }, [stats])

  if (loading) {
    return (
      <AdminGuard>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#20b2aa] mx-auto mb-2"></div>
              <p className="text-gray-600">Loading attendance stats...</p>
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
                onClick={() => router.push('/admin')}
                className="text-[#20b2aa] hover:text-[#1a9b94]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Active Interns Attendance Flow</h1>
                <p className="text-gray-600 mt-1">Overall attendance statistics and flow visualization</p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-[#40e0d0]/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Active Interns</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalActive}</p>
                  </div>
                  <Users className="h-8 w-8 text-[#20b2aa]" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">On-Time</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{stats.onTime}</p>
                    <p className="text-xs text-gray-500 mt-1">{flowData.onTimePercent}%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Late</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">{stats.late}</p>
                    <p className="text-xs text-gray-500 mt-1">{flowData.latePercent}%</p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Absent</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{stats.absent}</p>
                    <p className="text-xs text-gray-500 mt-1">{flowData.absentPercent}%</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Flowchart Visualization */}
          <Card className="border-[#40e0d0]/30">
            <CardHeader>
              <CardTitle className="text-[#1a9b94] flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Attendance Flow Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Flow Diagram */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex flex-col items-center space-y-4">
                    {/* Start */}
                    <div className="bg-[#20b2aa] text-white px-6 py-3 rounded-lg font-semibold">
                      {stats.totalActive} Active Interns
                    </div>
                    
                    {/* Arrow */}
                    <div className="w-1 h-8 bg-[#20b2aa]"></div>
                    
                    {/* Branch */}
                    <div className="flex flex-wrap justify-center gap-4">
                      <div className="flex flex-col items-center">
                        <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium min-w-[120px] text-center">
                          {stats.onTime} On-Time
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{flowData.onTimePercent}%</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="bg-amber-500 text-white px-4 py-2 rounded-lg font-medium min-w-[120px] text-center">
                          {stats.late} Late
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{flowData.latePercent}%</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium min-w-[120px] text-center">
                          {stats.absent} Absent
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{flowData.absentPercent}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Department Breakdown */}
          {departmentStats.length > 0 && (
            <Card className="border-[#40e0d0]/30">
              <CardHeader>
                <CardTitle className="text-[#1a9b94]">Department Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departmentStats.map((dept, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{dept.department}</h3>
                      <p className="text-sm text-gray-600">{dept.count} active intern{dept.count !== 1 ? 's' : ''}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  )
}

