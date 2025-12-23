"use client"

import { AdminGuard } from "@/components/auth-guard"
import { AdminLayout } from "@/components/admin-layout"
import { ProfileEditor } from "@/components/profile-editor"

export default function AdminProfilePage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <ProfileEditor
          heading="Admin Profile"
          description="Update your administrator contact details"
        />
      </AdminLayout>
    </AdminGuard>
  )
}







