"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getCurrentUser } from "@/lib/auth"
import { useEffect, useState } from "react"
import { Notifications } from "@/components/notifications"

export function Header() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    fetchUser()
  }, [])

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-primary">Intern Attendance System</h1>
        </div>

        <div className="flex items-center gap-4">
          <Notifications variant={user?.isAdmin ? 'admin' : 'intern'} />

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.fullName || user?.username || "Admin"}</p>
              <p className="text-xs text-muted-foreground">{user?.username || user?.email || ""}</p>
            </div>
            <Avatar>
              {user?.profilePhoto && (
                <AvatarImage src={user.profilePhoto} alt={user?.fullName || user?.username} />
              )}
              <AvatarFallback className="bg-primary text-primary-foreground">
                {(user?.fullName || user?.username || "A")?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  )
}
