"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Home, Building, Save, Phone, Lock } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { toast } from "sonner"

interface ProfileEditorProps {
  heading?: string
  description?: string
}

export function ProfileEditor({
  heading = "Profile",
  description = "View and manage your account information"
}: ProfileEditorProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    address: "",
    department: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  })

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        setFormData({
          fullName: currentUser.fullName || "",
          username: currentUser.username || "",
          email: currentUser.email || "",
          address: currentUser.address || "",
          department: currentUser.department || "",
          emergencyContactName: currentUser.emergencyContactName || "",
          emergencyContactPhone: currentUser.emergencyContactPhone || "",
          phoneNumber: currentUser.phoneNumber || "",
          password: "",
          confirmPassword: ""
        })
      }
      setLoading(false)
    }
    fetchUser()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (!user) {
    return <div className="flex items-center justify-center h-64">User not found</div>
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (user?.isAdmin) {
      if (formData.password && formData.password !== formData.confirmPassword) {
        toast.error("Password and confirmation do not match")
        return
      }
      if (!formData.phoneNumber) {
        toast.error("Contact number is required")
        return
      }
    } else {
      if (!formData.address || !formData.emergencyContactName || !formData.emergencyContactPhone) {
        toast.error("Please complete all required fields")
        return
      }
    }

    setSaving(true)
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          department: formData.department,
          address: user?.isAdmin ? undefined : formData.address,
          emergencyContactName: user?.isAdmin ? undefined : formData.emergencyContactName,
          emergencyContactPhone: user?.isAdmin ? undefined : formData.emergencyContactPhone,
          phoneNumber: user?.isAdmin ? formData.phoneNumber : undefined,
          password: formData.password || undefined,
          isAdmin: user?.isAdmin
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success("Profile updated successfully!")
        setEditing(false)
        setUser({ ...user, ...formData })
        localStorage.setItem("currentUser", JSON.stringify({ ...user, ...formData }))
        setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }))
      } else {
        toast.error(result.error || "Failed to update profile")
      }
    } catch (error) {
      toast.error("Failed to update profile")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setFormData({
      fullName: user.fullName || "",
      username: user.username || "",
      email: user.email || "",
      address: user.address || "",
      department: user.department || "",
      emergencyContactName: user.emergencyContactName || "",
      emergencyContactPhone: user.emergencyContactPhone || "",
      phoneNumber: user.phoneNumber || "",
      password: "",
      confirmPassword: ""
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{heading}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Your account details and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                <User className="inline h-4 w-4 mr-1" />
                Full Name
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">
                <User className="inline h-4 w-4 mr-1" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => handleInputChange("email", e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
                required
              />
            </div>

            {!user?.isAdmin && (
              <>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">
                    <Home className="inline h-4 w-4 mr-1" />
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    disabled={!editing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">
                    <Building className="inline h-4 w-4 mr-1" />
                    Department
                  </Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                    disabled={!editing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyName">Emergency Contact Name</Label>
                  <Input
                    id="emergencyName"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                    disabled={!editing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                    disabled={!editing}
                  />
                </div>
              </>
            )}

            {user?.isAdmin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Contact Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    disabled={!editing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">
                    <Building className="inline h-4 w-4 mr-1" />
                    Department
                  </Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                    disabled={!editing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    <Lock className="inline h-4 w-4 mr-1" />
                    New Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    disabled={!editing}
                    placeholder="Leave blank to keep current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    <Lock className="inline h-4 w-4 mr-1" />
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    disabled={!editing}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            {!editing ? (
              <Button onClick={() => setEditing(true)}>
                <Save className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={saving}>
                  Cancel
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

