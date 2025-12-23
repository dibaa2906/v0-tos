import db from './db'

// User operations
export function getUserByUsername(username: string) {
  // Optimized query - use index on username for faster lookups
  // Case-insensitive comparison using COLLATE NOCASE (faster than LOWER())
  return db.prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE').get(username) as any
}

export function getUserById(id: string) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any
}

export function getNextUserId(): string {
  // Get the highest user ID as a number
  const result = db.prepare('SELECT id FROM users ORDER BY CAST(id AS INTEGER) DESC LIMIT 1').get() as any
  
  if (!result) {
    return '01' // First user
  }
  
  // Get current ID as number and increment
  const currentId = parseInt(result.id, 10)
  const nextId = currentId + 1
  
  // Format with leading zero (01, 02, ... 09, 10, 11, etc.)
  return nextId.toString().padStart(2, '0')
}

export function createUser(user: any) {
  const stmt = db.prepare(`
    INSERT INTO users (id, fullName, username, email, address, department, emergencyContactName, emergencyContactPhone, phoneNumber, isPhoneVerified, password, profilePhoto, isAdmin, institution, lecturerContactName, lecturerContactPhone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  return stmt.run(
    user.id,
    user.fullName,
    user.username,
    user.email,
    user.address,
    user.department,
    user.emergencyContactName,
    user.emergencyContactPhone,
    user.phoneNumber || user.emergencyContactPhone || '', // Use phoneNumber if provided, fallback to emergencyContactPhone
    user.isPhoneVerified ? 1 : 0,
    user.password,
    user.profilePhoto || null,
    user.isAdmin ? 1 : 0,
    user.institution || null,
    user.lecturerContactName || null,
    user.lecturerContactPhone || null
  )
}

export function updateUser(id: string, updates: Partial<any>) {
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ')
  const values = Object.values(updates)
  const stmt = db.prepare(`UPDATE users SET ${fields} WHERE id = ?`)
  return stmt.run(...values, id)
}

// Attendance operations
export function getAttendanceByUserAndDate(userId: string, date: string) {
  return db.prepare('SELECT * FROM attendance WHERE userId = ? AND date = ?').get(userId, date) as any
}

export function getAttendanceByUser(userId: string) {
  return db.prepare('SELECT * FROM attendance WHERE userId = ? ORDER BY date DESC').all(userId) as any[]
}

export function createAttendance(attendance: any) {
  const stmt = db.prepare(`
    INSERT INTO attendance (
      id, userId, date, clockInTime, clockOutTime, clockInImage, clockOutImage,
      clockInLatitude, clockInLongitude, clockOutLatitude, clockOutLongitude, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  return stmt.run(
    attendance.id,
    attendance.userId,
    attendance.date,
    attendance.clockInTime,
    attendance.clockOutTime,
    attendance.clockInImage,
    attendance.clockOutImage,
    attendance.clockInLatitude,
    attendance.clockInLongitude,
    attendance.clockOutLatitude,
    attendance.clockOutLongitude,
    attendance.status
  )
}

export function updateAttendance(id: string, updates: Partial<any>) {
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ')
  const values = Object.values(updates)
  const stmt = db.prepare(`UPDATE attendance SET ${fields} WHERE id = ?`)
  return stmt.run(...values, id)
}

// Volume logs operations
export function getVolumeLogByUserAndDate(userId: string, date: string) {
  return db.prepare('SELECT * FROM volume_logs WHERE userId = ? AND date = ?').get(userId, date) as any
}

export function getVolumeLogsByUser(userId: string) {
  return db.prepare('SELECT * FROM volume_logs WHERE userId = ? ORDER BY date DESC').all(userId) as any[]
}

export function getAllVolumeLogs() {
  return db.prepare(`
    SELECT 
      vl.*,
      u.fullName,
      u.email,
      u.department
    FROM volume_logs vl
    JOIN users u ON vl.userId = u.id
    ORDER BY vl.date DESC
  `).all() as any[]
}

export function createVolumeLog(log: any) {
  // First verify the user exists
  const user = getUserById(log.userId)
  if (!user) {
    throw new Error(`User with ID ${log.userId} not found`)
  }
  
  const stmt = db.prepare(`
    INSERT INTO volume_logs (id, userId, date, content)
    VALUES (?, ?, ?, ?)
  `)
  
  try {
    return stmt.run(log.id, log.userId, log.date, log.content || '')
  } catch (error: any) {
    console.error(`Error creating volume log - UserId: ${log.userId}, User exists: ${!!user}, Error:`, error.message)
    throw error
  }
}

export function updateVolumeLog(id: string, content: string) {
  return db.prepare('UPDATE volume_logs SET content = ? WHERE id = ?').run(content, id)
}

// Leave applications operations
export function getLeaveApplicationsByUser(userId: string) {
  return db.prepare('SELECT * FROM leave_applications WHERE userId = ? ORDER BY appliedAt DESC').all(userId) as any[]
}

export function createLeaveApplication(application: any) {
  const stmt = db.prepare(`
    INSERT INTO leave_applications (
      id, userId, startDate, endDate, reason, status
    ) VALUES (?, ?, ?, ?, ?, ?)
  `)
  return stmt.run(
    application.id,
    application.userId,
    application.startDate,
    application.endDate,
    application.reason,
    application.status
  )
}

export function updateLeaveApplication(id: string, updates: Partial<any>) {
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ')
  const values = Object.values(updates)
  const stmt = db.prepare(`UPDATE leave_applications SET ${fields} WHERE id = ?`)
  return stmt.run(...values, id)
}

export function deleteLeaveApplication(id: string) {
  console.log('🗑️ deleteLeaveApplication called with ID:', id)
  // Use parameterized query to ensure exact ID match
  const stmt = db.prepare('DELETE FROM leave_applications WHERE id = ?')
  const result = stmt.run(id)
  console.log('🗑️ Delete result:', { changes: result.changes, lastInsertRowid: result.lastInsertRowid })
  return result
}
