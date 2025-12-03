"use client"

import { ReactNode, useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 flex flex-col transition-all duration-300">
        <Header />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}



