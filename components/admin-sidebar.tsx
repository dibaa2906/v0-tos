"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Calendar, BarChart3, FileText, LogOut, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { logout } from "@/lib/auth"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"

interface AdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const adminMenuItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: Users, label: "Interns", href: "/admin/interns" },
  { icon: Calendar, label: "Leave Review", href: "/admin/leaves" },
  { icon: BarChart3, label: "Reports", href: "/admin/reports" },
  { icon: Clock, label: "Attendance", href: "/admin/attendance" },
  { icon: FileText, label: "Volume Logs", href: "/admin/logs" },
  { icon: Users, label: "Profile", href: "/admin/profile" },
]

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-sidebar-primary-foreground rounded-sm"></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-sidebar-foreground">Admin Panel</span>
                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">ADMIN</span>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {adminMenuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href!}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed ? "px-2" : "px-3",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", collapsed ? "" : "mr-3")} />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="p-2 border-t border-sidebar-border">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed ? "px-2" : "px-3",
            )}
          >
            <LogOut className={cn("h-5 w-5", collapsed ? "" : "mr-3")} />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  )
}

