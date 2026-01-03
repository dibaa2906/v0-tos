"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { InternDashboard } from "@/components/intern-dashboard"

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <InternDashboard />
      </DashboardLayout>
    </AuthGuard>
  )
}
