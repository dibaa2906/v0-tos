"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Settings, BarChart3, FileText, LogOut, ChevronLeft, ChevronRight, DollarSign, ChevronDown, Plus, List } from "lucide-react"
import { logout } from "@/lib/auth"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useState } from "react"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

interface MenuItem {
  icon: any
  label: string
  href?: string
  submenu?: { icon: any; label: string; href: string }[]
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { 
    icon: DollarSign, 
    label: "Budget", 
    submenu: [
      { icon: Plus, label: "Add Budget", href: "/budget/add" },
      { icon: List, label: "Budget List", href: "/budget/list" }
    ]
  },
  { icon: Users, label: "Users", href: "/dashboard/users" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: FileText, label: "Reports", href: "/dashboard/reports" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const toggleSubmenu = (label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    )
  }

  const isSubmenuExpanded = (label: string) => expandedMenus.includes(label)

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-sidebar-primary-foreground rounded-sm"></div>
              </div>
              <span className="text-lg font-semibold text-sidebar-foreground">Intern Attendance</span>
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

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {menuItems.map((item) => {
            if (item.submenu) {
              const isExpanded = isSubmenuExpanded(item.label)
              const hasActiveSubmenu = item.submenu.some(sub => pathname === sub.href)
              
              return (
                <div key={item.label}>
                  <Button
                    variant="ghost"
                    onClick={() => !collapsed && toggleSubmenu(item.label)}
                    className={cn(
                      "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      collapsed ? "px-2" : "px-3",
                      hasActiveSubmenu && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", collapsed ? "" : "mr-3")} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded && "rotate-180"
                        )} />
                      </>
                    )}
                  </Button>
                  
                  {!collapsed && isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.submenu.map((subItem) => {
                        const isActive = pathname === subItem.href
                        return (
                          <Link key={subItem.href} href={subItem.href}>
                            <Button
                              variant="ghost"
                              className={cn(
                                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm",
                                "px-3",
                                isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                              )}
                            >
                              <subItem.icon className="h-4 w-4 mr-3" />
                              <span>{subItem.label}</span>
                            </Button>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            } else {
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
            }
          })}
        </nav>

        {/* Footer */}
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
