"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { LayoutDashboard, Clock, FileText, History, Calendar, User, ChevronRight, LogOut, ChevronLeft, Menu, BarChart3, BookOpen, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => {
    // Clear localStorage
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('currentUserId')
    localStorage.removeItem('currentUser')
    
    // Clear sessionStorage
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('isAuthenticated')
        sessionStorage.removeItem('currentUserId')
        sessionStorage.removeItem('currentUser')
      }
    } catch (error) {
      console.error('Error clearing sessionStorage:', error)
    }
    
    // Clear cookies via API
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Error clearing cookies:', error)
    }
    
    // Small delay to ensure all storage is cleared before redirect
    setTimeout(() => {
      // Use replace to prevent back button issues and ensure clean redirect
      window.location.replace('/?logout=true')
    }, 100)
  }

  if (loading) {
    return (
      <aside className={`${collapsed ? 'w-16' : 'w-64'} min-h-screen border-r bg-white flex flex-col py-7 transition-all duration-300 flex-shrink-0`}>
        <div className="mb-8 px-6">
          <div className="h-6 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </aside>
    )
  }

  // Check if user is admin (handle both number and boolean)
  const isAdmin = user?.isAdmin === 1 || user?.isAdmin === true || user?.isAdmin === '1'

  // If on admin pages, show admin sidebar
  if (isAdmin && pathname?.startsWith('/admin')) {
    return (
      <aside className={`${collapsed ? 'w-24' : 'w-64'} min-h-screen border-r bg-white flex flex-col py-7 transition-all duration-300 flex-shrink-0`}>
        <div className="mb-8 px-6">
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg text-[#20b2aa] flex items-center gap-2">
              {!collapsed && (
                <>
                  Admin Panel 
                  <span className="text-xs bg-[#40e0d0]/20 text-[#20b2aa] px-2 py-1 rounded uppercase border border-[#40e0d0]/30">
                    Admin
                  </span>
                </>
              )}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle || (() => {})}
              className="h-8 w-8 p-0 hover:bg-gray-100 flex-shrink-0 border border-gray-200"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="h-5 w-5 text-gray-600" /> : <ChevronLeft className="h-5 w-5 text-gray-600" />}
            </Button>
          </div>
        </div>
        <nav className="flex-1 space-y-2 px-6">
          <a href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#40e0d0]/10 text-gray-700 hover:text-[#20b2aa] transition-colors" title={collapsed ? 'Overview' : undefined}>
            <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Overview</span>}
          </a>
          <a href="/admin/interns" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#40e0d0]/10 text-gray-700 hover:text-[#20b2aa] transition-colors" title={collapsed ? 'Interns' : undefined}>
            <User className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Interns</span>}
          </a>
          <a href="/admin/leaves" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#40e0d0]/10 text-gray-700 hover:text-[#20b2aa] transition-colors" title={collapsed ? 'Leave Review' : undefined}>
            <Calendar className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Leave Review</span>}
          </a>
          <a href="/admin/reports" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#40e0d0]/10 text-gray-700 hover:text-[#20b2aa] transition-colors" title={collapsed ? 'Reports' : undefined}>
            <BarChart3 className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Reports</span>}
          </a>
          <a href="/admin/attendance" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#40e0d0]/10 text-gray-700 hover:text-[#20b2aa] transition-colors" title={collapsed ? 'Attendance' : undefined}>
            <Clock className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Attendance</span>}
          </a>
          <a href="/admin/logs" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#40e0d0]/10 text-gray-700 hover:text-[#20b2aa] transition-colors" title={collapsed ? 'Volume Logs' : undefined}>
            <FileText className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Volume Logs</span>}
          </a>
          <a href="/admin/profile" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#40e0d0]/10 text-gray-700 hover:text-[#20b2aa] transition-colors" title={collapsed ? 'Profile' : undefined}>
            <User className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Profile</span>}
          </a>
        </nav>
        <div className="px-6 mt-auto pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="h-5 w-5 mr-3" />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </aside>
    )
  }
  
  // Show intern sidebar for regular users
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/attendance', label: 'Clock In/Out', icon: Clock },
    { href: '/dashboard/logs', label: 'Volume Logs', icon: FileText },
    { href: '/dashboard/history', label: 'Attendance History', icon: History },
    { href: '/dashboard/leave', label: 'Leave Applications', icon: Calendar },
    { href: '/dashboard/regulations', label: 'Regulations', icon: BookOpen },
    { href: 'https://langkawiport.com.my/directory/staff-directory/', label: 'Staff Directory', icon: Users, external: true },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
  ]

  return (
    <aside className={`${collapsed ? 'w-24' : 'w-64'} min-h-screen border-r bg-white flex flex-col py-7 transition-all duration-300 flex-shrink-0`}>
      <div className="mb-8 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!collapsed && (
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            )}
            {!collapsed && (
              <>
                <span className="font-bold text-lg text-foreground">Intern System</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle || (() => {})}
            className="h-8 w-8 p-0 hover:bg-gray-100 flex-shrink-0 border border-gray-200"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-5 w-5 text-gray-600" /> : <ChevronLeft className="h-5 w-5 text-gray-600" />}
          </Button>
        </div>
      </div>
      
      <nav className="flex-1 space-y-2 px-6">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = !item.external && pathname === item.href
          return (
            <a
              key={item.href}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </a>
          )
        })}
      </nav>

      {/* Admin section for admins on dashboard */}
      {isAdmin && (
        <div className="px-6 mt-8 border-t pt-4">
          {!collapsed && (
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">ADMIN</p>
          )}
          <nav className="space-y-2">
            <a
              href="/admin"
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-gray-700 hover:bg-gray-100`}
              title={collapsed ? 'Admin Overview' : undefined}
            >
              <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>Overview</span>}
            </a>
            {!collapsed && (
              <>
                <a href="/admin/interns" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors text-sm">Manage Interns</a>
                <a href="/admin/logs" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors text-sm">All Volume Logs</a>
                <a href="/admin/attendance" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors text-sm">All Attendance</a>
                <a href="/admin/leaves" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors text-sm">All Leaves</a>
              </>
            )}
          </nav>
        </div>
      )}

      <div className="px-6 mt-auto pt-4 border-t">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-gray-700 hover:bg-gray-100"
        >
          <LogOut className="h-5 w-5 mr-3" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  )
}
