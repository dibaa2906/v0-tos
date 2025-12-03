"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar, Filter, Download } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface AdminTopbarProps {
  title: string
  month?: string
  onMonthChange?: (month: string) => void
  department?: string
  onDepartmentChange?: (dept: string) => void
  departments?: string[]
  showFilters?: boolean
  onExport?: () => void
  exportLabel?: string
}

export function AdminTopbar({
  title,
  month,
  onMonthChange,
  department,
  onDepartmentChange,
  departments = [],
  showFilters = false,
  onExport,
  exportLabel = "Export"
}: AdminTopbarProps) {
  const [currentMonth, setCurrentMonth] = useState(month || new Date().toISOString().slice(0, 7))
  const [currentDept, setCurrentDept] = useState(department || '')

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMonth = e.target.value
    setCurrentMonth(newMonth)
    onMonthChange?.(newMonth)
  }

  const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDept = e.target.value
    setCurrentDept(newDept)
    onDepartmentChange?.(newDept)
  }

  return (
    <div className="sticky top-0 z-10 bg-white border-b shadow-sm mb-6">
      <Card className="border-0 shadow-none rounded-none p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {showFilters && (
              <>
                {onMonthChange && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <Input
                      type="month"
                      value={currentMonth}
                      onChange={handleMonthChange}
                      className="w-auto"
                    />
                  </div>
                )}
                
                {onDepartmentChange && departments.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select
                      value={currentDept}
                      onChange={handleDeptChange}
                      className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                    >
                      <option value="">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
            
            {onExport && (
              <Button onClick={onExport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                {exportLabel}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}



