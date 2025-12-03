// Attendance utilities for intern attendance system

export interface Attendance {
  id: string
  userId: string
  date: string
  clockInTime: string | null
  clockOutTime: string | null
  clockInImage: string | null
  clockOutImage: string | null
  clockInLocation: { lat: number; lng: number } | null
  clockOutLocation: { lat: number; lng: number } | null
  status: "on-time" | "late" | "absent"
  latitude?: number
  longitude?: number
}

export interface VolumeLog {
  id: string
  userId: string
  date: string
  content: string
  createdAt: string
}

export interface LeaveApplication {
  id: string
  userId: string
  startDate: string
  endDate: string
  reason: string
  status: "pending" | "approved_supervisor" | "approved_hod" | "rejected"
  appliedAt: string
  supervisorApprovedAt: string | null
  hodApprovedAt: string | null
  rejectedAt: string | null
  rejectedBy: string | null
}

const ALLOWED_LOCATION = {
  lat: 6.292279618596812, // Your office latitude
  lng: 99.78659978585995, // Your office longitude
  radius: 300 // meters
}

export function getAttendanceRecords(userId: string): Attendance[] {
  if (typeof window === "undefined") return []
  const recordsJson = localStorage.getItem(`attendance_${userId}`)
  return recordsJson ? JSON.parse(recordsJson) : []
}

export function saveAttendanceRecord(record: Attendance): void {
  if (typeof window === "undefined") return
  const records = getAttendanceRecords(record.userId)
  const existingIndex = records.findIndex(r => r.date === record.date)
  
  if (existingIndex >= 0) {
    records[existingIndex] = record
  } else {
    records.push(record)
  }
  
  localStorage.setItem(`attendance_${record.userId}`, JSON.stringify(records))
}

export function getTodayAttendance(userId: string): Attendance | null {
  const today = new Date().toISOString().split('T')[0]
  const records = getAttendanceRecords(userId)
  return records.find(r => r.date === today) || null
}

export function clockIn(userId: string, image: string, location: { lat: number; lng: number }): Attendance {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const time = now.toTimeString().split(' ')[0]
  
  // Check if on time (before 8:00 AM)
  const status = now.getHours() < 8 ? "on-time" : "late"
  
  const attendance: Attendance = {
    id: Date.now().toString(),
    userId,
    date: today,
    clockInTime: time,
    clockOutTime: null,
    clockInImage: image,
    clockOutImage: null,
    clockInLocation: location,
    clockOutLocation: null,
    status,
    latitude: location.lat,
    longitude: location.lng
  }
  
  saveAttendanceRecord(attendance)
  return attendance
}

export function clockOut(userId: string, image: string, location: { lat: number; lng: number }): Attendance | null {
  const today = new Date().toISOString().split('T')[0]
  const existing = getTodayAttendance(userId)
  
  if (!existing) {
    throw new Error("No clock-in record found for today")
  }
  
  const now = new Date()
  const time = now.toTimeString().split(' ')[0]
  
  const updated: Attendance = {
    ...existing,
    clockOutTime: time,
    clockOutImage: image,
    clockOutLocation: location
  }
  
  saveAttendanceRecord(updated)
  return updated
}

export function checkLocationAccess(location: { lat: number; lng: number }): boolean {
  const distance = calculateDistance(
    location.lat,
    location.lng,
    ALLOWED_LOCATION.lat,
    ALLOWED_LOCATION.lng
  )
  
  return distance <= ALLOWED_LOCATION.radius
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lng2 - lng1) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c
}

export function getVolumeLogs(userId: string): VolumeLog[] {
  if (typeof window === "undefined") return []
  const logsJson = localStorage.getItem(`volumeLogs_${userId}`)
  return logsJson ? JSON.parse(logsJson) : []
}

export function saveVolumeLog(log: VolumeLog): void {
  if (typeof window === "undefined") return
  const logs = getVolumeLogs(log.userId)
  logs.push(log)
  localStorage.setItem(`volumeLogs_${log.userId}`, JSON.stringify(logs))
}

export function getTodayVolumeLog(userId: string): VolumeLog | null {
  const today = new Date().toISOString().split('T')[0]
  const logs = getVolumeLogs(userId)
  return logs.find(log => log.date === today) || null
}

export function updateTodayVolumeLog(userId: string, content: string): void {
  const today = new Date().toISOString().split('T')[0]
  const existing = getTodayVolumeLog(userId)
  
  if (existing) {
    existing.content = content
    const logs = getVolumeLogs(userId)
    const index = logs.findIndex(log => log.id === existing.id)
    if (index >= 0) {
      logs[index] = existing
      localStorage.setItem(`volumeLogs_${userId}`, JSON.stringify(logs))
    }
  } else {
    saveVolumeLog({
      id: Date.now().toString(),
      userId,
      date: today,
      content,
      createdAt: new Date().toISOString()
    })
  }
}

export function getLeaveApplications(userId: string): LeaveApplication[] {
  if (typeof window === "undefined") return []
  const applicationsJson = localStorage.getItem(`leaveApplications_${userId}`)
  return applicationsJson ? JSON.parse(applicationsJson) : []
}

export function saveLeaveApplication(application: LeaveApplication): void {
  if (typeof window === "undefined") return
  const applications = getLeaveApplications(application.userId)
  applications.push(application)
  localStorage.setItem(`leaveApplications_${application.userId}`, JSON.stringify(applications))
}

export function canEditVolumeLog(date: string): boolean {
  const today = new Date().toISOString().split('T')[0]
  return date === today
}

export function canAccessVolumeLog(): boolean {
  const now = new Date()
  const hour = now.getHours()
  return hour >= 8 && hour < 19 // 8 AM to 7 PM
}
