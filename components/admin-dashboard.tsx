"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, BarChart3, FileText } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"

export function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    myInterns: 1,
    pendingLeaves: 0,
    totalInterns: 3,
    activeInterns: 3
  })

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
    // TODO: Fetch real stats from API
  }, [])

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-primary text-primary-foreground border-0">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {user?.name || 'Admin'}!
          </h2>
          <p className="text-lg opacity-90">
            Here is what's happening with your interns today.
          </p>
          <p className="mt-2 text-sm opacity-75">
            FOCUSED ON YOUR DEPARTMENT
          </p>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              My Interns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.myInterns}</div>
            <p className="text-sm text-muted-foreground mt-1">{stats.myInterns} active today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Pending Leaves (My Dept)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingLeaves}</div>
            <p className="text-sm text-muted-foreground mt-1">Need your approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full" variant="outline">
              <Link href="/admin/interns">Manage My Interns</Link>
            </Button>
            <Button asChild className="w-full" variant="outline">
              <Link href="/admin/leaves">Review Leaves</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Company Overview */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Company Overview</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Interns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInterns}</div>
              <p className="text-sm text-muted-foreground mt-1">{stats.totalInterns} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Leaves</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingLeaves}</div>
              <p className="text-sm text-muted-foreground mt-1">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Interns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeInterns}</div>
              <p className="text-sm text-muted-foreground mt-1">Out of {stats.totalInterns} total</p>
              <Link href="/admin/interns" className="text-sm text-primary mt-2 block">View All</Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Attendance Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/admin/attendance" className="text-sm text-primary">View Chart</Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interns List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Interns</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">My Interns</Button>
              <Button variant="ghost" size="sm">All Interns</Button>
              <Button variant="ghost" size="sm">Recent Leaves</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            Showing interns from your department
          </div>
          <div className="border rounded-lg">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-semibold">NAME</th>
                  <th className="text-left p-3 font-semibold">EMAIL</th>
                  <th className="text-left p-3 font-semibold">STATUS</th>
                  <th className="text-left p-3 font-semibold">JOINED</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-3">Wan Adiba Embun binti W Othman</td>
                  <td className="p-3">wanadiba2906@gmail.com</td>
                  <td className="p-3">
                    <Badge className="bg-green-500">Active</Badge>
                  </td>
                  <td className="p-3">28/10/2025</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

