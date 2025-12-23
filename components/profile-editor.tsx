"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCurrentUser } from "@/lib/auth"
import { toast } from "sonner"
import { Save, Edit2, X } from "lucide-react"

interface ProfileEditorProps {
  heading?: string
  description?: string
}

export function ProfileEditor({ 
  heading = "My Profile", 
  description = "Update your profile information" 
}: ProfileEditorProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    institution: '',
    lecturerContactName: '',
    lecturerContactPhone: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          setFormData({
            fullName: currentUser.fullName || '',
            username: currentUser.username || '',
            email: currentUser.email || '',
            phoneNumber: currentUser.phoneNumber || '',
            address: currentUser.address || '',
            emergencyContactName: currentUser.emergencyContactName || '',
            emergencyContactPhone: currentUser.emergencyContactPhone || '',
            institution: currentUser.institution || '',
            lecturerContactName: currentUser.lecturerContactName || '',
            lecturerContactPhone: currentUser.lecturerContactPhone || '',
            password: '',
            confirmPassword: ''
          })
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!user) return

    // Validate required fields
    if (!formData.fullName || !formData.username || !formData.email) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate password if provided
    if (formData.password) {
      if (formData.password.length < 8) {
        toast.error('Password must be at least 8 characters long')
        return
      }
      if (!/[a-zA-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
        toast.error('Password must include both letters and numbers')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match')
        return
      }
    }

    // Validate phone number format if provided
    if (formData.phoneNumber && !/^[0-9+\-\s()]+$/.test(formData.phoneNumber)) {
      toast.error('Please enter a valid phone number')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
          institution: formData.institution,
          lecturerContactName: formData.lecturerContactName,
          lecturerContactPhone: formData.lecturerContactPhone,
          password: formData.password || undefined,
          department: user.department,
          isAdmin: user.isAdmin
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Profile updated successfully')
        setEditing(false)
        // Refresh user data
        const updatedUser = await getCurrentUser()
        if (updatedUser) {
          setUser(updatedUser)
          setFormData(prev => ({
            ...prev,
            password: '',
            confirmPassword: ''
          }))
        }
      } else {
        toast.error(data.error || data.message || 'Failed to update profile')
      }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(`Failed to update profile: ${error.message || 'Network error'}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">User not found</p>
      </div>
    )
  }

  const isAdmin = user.isAdmin

  return (
    <div className="w-full h-[calc(100vh-8rem)] -m-6 overflow-auto">
      <Card className="h-full rounded-none border-x-0 flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{heading}</CardTitle>
              <CardDescription className="text-base">{description}</CardDescription>
            </div>
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="outline" size="sm">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <Button onClick={() => setEditing(false)} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-base">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                disabled={!editing}
                className="text-base h-11"
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-base">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                disabled={!editing}
                className="text-base h-11"
              />
            </div>

            {/* Email - Read-only before editing */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!editing}
                readOnly={!editing}
                className={`text-base h-11 ${!editing ? "bg-muted cursor-not-allowed" : ""}`}
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-base">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                disabled={!editing}
                placeholder="e.g., +60123456789"
                className="text-base h-11"
              />
            </div>

            {/* Address (for interns only) */}
            {!isAdmin && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="text-base">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!editing}
                  className="text-base h-11"
                />
              </div>
            )}

            {/* Emergency Contact Name (for interns only) */}
            {!isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName" className="text-base">Emergency Contact Name</Label>
                <Input
                  id="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                  disabled={!editing}
                  className="text-base h-11"
                />
              </div>
            )}

            {/* Emergency Contact Phone (for interns only) */}
            {!isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone" className="text-base">Emergency Contact Phone</Label>
                <Input
                  id="emergencyContactPhone"
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                  disabled={!editing}
                  placeholder="e.g., +60123456789"
                  className="text-base h-11"
                />
              </div>
            )}

            {/* Institution/University (for interns only) */}
            {!isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="institution" className="text-base">University/Institution</Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => handleInputChange('institution', e.target.value)}
                  disabled={!editing}
                  placeholder="e.g., Universiti Teknologi MARA"
                  className="text-base h-11"
                />
              </div>
            )}

            {/* Lecturer Contact Name (for interns only) */}
            {!isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="lecturerContactName" className="text-base">Lecturer Name</Label>
                <Input
                  id="lecturerContactName"
                  value={formData.lecturerContactName}
                  onChange={(e) => handleInputChange('lecturerContactName', e.target.value)}
                  disabled={!editing}
                  className="text-base h-11"
                />
              </div>
            )}

            {/* Lecturer Contact Phone (for interns only) */}
            {!isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="lecturerContactPhone" className="text-base">Lecturer Phone</Label>
                <Input
                  id="lecturerContactPhone"
                  type="tel"
                  value={formData.lecturerContactPhone}
                  onChange={(e) => handleInputChange('lecturerContactPhone', e.target.value)}
                  disabled={!editing}
                  placeholder="e.g., +60123456789"
                  className="text-base h-11"
                />
              </div>
            )}
          </div>

          {/* Password Section */}
          {editing && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold">Change Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-base">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Leave empty to keep current password"
                    className="text-base h-11"
                  />
                  <p className="text-sm text-muted-foreground">
                    Must be at least 8 characters with letters and numbers
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-base">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                    className="text-base h-11"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          {editing && (
            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

