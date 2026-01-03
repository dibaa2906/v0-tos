/**
 * Database utility functions
 * Handles volume logs and user queries
 */

import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

// Get database path from environment or use default
const getDatabasePath = (): string => {
  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'attendance.db')
  
  // Ensure data directory exists
  const dataDir = path.dirname(dbPath)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  
  return dbPath
}

// Initialize database connection
let db: Database.Database | null = null

function getDb(): Database.Database {
  if (!db) {
    try {
      const dbPath = getDatabasePath()
      db = new Database(dbPath)
      
      // Enable foreign keys
      db.pragma('foreign_keys = ON')
      
      // Initialize tables if they don't exist
      initializeTables(db)
    } catch (error) {
      console.error('Database connection error:', error)
      throw new Error('Failed to connect to database. Please check database path and permissions.')
    }
  }
  return db
}

function initializeTables(database: Database.Database): void {
  // Create volume_logs table if it doesn't exist
  database.exec(`
    CREATE TABLE IF NOT EXISTS volume_logs (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      date TEXT NOT NULL,
      content TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `)

  // Create index for faster queries
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_volume_logs_user_date 
    ON volume_logs(userId, date)
  `)

  // Create attendance_records table (clock-in/out)
  database.exec(`
    CREATE TABLE IF NOT EXISTS attendance_records (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      date TEXT NOT NULL,
      clockIn TEXT,
      clockOut TEXT,
      breakStart TEXT,
      breakEnd TEXT,
      totalHours REAL,
      status TEXT DEFAULT 'present',
      notes TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `)

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_attendance_user_date 
    ON attendance_records(userId, date)
  `)

  // Create leave_applications table
  database.exec(`
    CREATE TABLE IF NOT EXISTS leave_applications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      leaveType TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      days REAL NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      approvedBy TEXT,
      approvedAt TEXT,
      rejectionReason TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `)

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_leave_user_date 
    ON leave_applications(userId, startDate)
  `)
}

// Volume Log Functions

export interface VolumeLog {
  id: string
  userId: string
  date: string
  content: string
  createdAt?: string
  updatedAt?: string
}

export function getVolumeLogByUserAndDate(userId: string, date: string): VolumeLog | null {
  try {
    const database = getDb()
    const stmt = database.prepare('SELECT * FROM volume_logs WHERE userId = ? AND date = ?')
    const result = stmt.get(userId, date) as VolumeLog | undefined
    return result || null
  } catch (error) {
    console.error('Error getting volume log:', error)
    return null
  }
}

export function getVolumeLogsByUser(userId: string): VolumeLog[] {
  try {
    const database = getDb()
    const stmt = database.prepare('SELECT * FROM volume_logs WHERE userId = ? ORDER BY date DESC')
    const results = stmt.all(userId) as VolumeLog[]
    return results || []
  } catch (error) {
    console.error('Error getting volume logs by user:', error)
    return []
  }
}

export function getAllVolumeLogs(): VolumeLog[] {
  try {
    const database = getDb()
    const stmt = database.prepare(`
      SELECT 
        vl.*,
        u.fullName,
        u.department
      FROM volume_logs vl
      LEFT JOIN users u ON vl.userId = u.id
      ORDER BY vl.date DESC
    `)
    const results = stmt.all() as any[]
    return results || []
  } catch (error) {
    console.error('Error getting all volume logs:', error)
    return []
  }
}

export function createVolumeLog(log: VolumeLog): void {
  try {
    const database = getDb()
    const stmt = database.prepare(`
      INSERT INTO volume_logs (id, userId, date, content, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `)
    stmt.run(log.id, log.userId, log.date, log.content || '')
  } catch (error) {
    console.error('Error creating volume log:', error)
    throw error
  }
}

export function updateVolumeLog(logId: string, content: string): void {
  try {
    const database = getDb()
    const stmt = database.prepare(`
      UPDATE volume_logs 
      SET content = ?, updatedAt = datetime('now')
      WHERE id = ?
    `)
    stmt.run(content, logId)
  } catch (error) {
    console.error('Error updating volume log:', error)
    throw error
  }
}

// User Functions

export interface User {
  id: string
  fullName?: string
  username?: string
  email?: string
  department?: string
  [key: string]: any
}

export function getUserById(userId: string): User | null {
  try {
    const database = getDb()
    const stmt = database.prepare('SELECT * FROM users WHERE id = ?')
    const result = stmt.get(userId) as User | undefined
    return result || null
  } catch (error) {
    console.error('Error getting user by ID:', error)
    return null
  }
}

export function getUserByEmail(email: string): User | null {
  try {
    const database = getDb()
    const stmt = database.prepare('SELECT * FROM users WHERE email = ?')
    const result = stmt.get(email) as User | undefined
    return result || null
  } catch (error) {
    console.error('Error getting user by email:', error)
    return null
  }
}

// Attendance Functions

export interface AttendanceRecord {
  id: string
  userId: string
  date: string
  clockIn?: string
  clockOut?: string
  breakStart?: string
  breakEnd?: string
  totalHours?: number
  status?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export function getAttendanceByUserAndDate(userId: string, date: string): AttendanceRecord | null {
  try {
    const database = getDb()
    const stmt = database.prepare('SELECT * FROM attendance_records WHERE userId = ? AND date = ?')
    const result = stmt.get(userId, date) as AttendanceRecord | undefined
    return result || null
  } catch (error) {
    console.error('Error getting attendance record:', error)
    return null
  }
}

export function getAttendanceHistoryByUser(userId: string, limit?: number): AttendanceRecord[] {
  try {
    const database = getDb()
    const query = limit 
      ? `SELECT * FROM attendance_records WHERE userId = ? ORDER BY date DESC LIMIT ?`
      : `SELECT * FROM attendance_records WHERE userId = ? ORDER BY date DESC`
    const stmt = database.prepare(query)
    const results = limit 
      ? stmt.all(userId, limit) as AttendanceRecord[]
      : stmt.all(userId) as AttendanceRecord[]
    return results || []
  } catch (error) {
    console.error('Error getting attendance history:', error)
    return []
  }
}

export function createAttendanceRecord(record: AttendanceRecord): void {
  try {
    const database = getDb()
    const stmt = database.prepare(`
      INSERT INTO attendance_records (id, userId, date, clockIn, clockOut, breakStart, breakEnd, totalHours, status, notes, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `)
    stmt.run(
      record.id,
      record.userId,
      record.date,
      record.clockIn || null,
      record.clockOut || null,
      record.breakStart || null,
      record.breakEnd || null,
      record.totalHours || null,
      record.status || 'present',
      record.notes || null
    )
  } catch (error) {
    console.error('Error creating attendance record:', error)
    throw error
  }
}

export function updateAttendanceRecord(recordId: string, updates: Partial<AttendanceRecord>): void {
  try {
    const database = getDb()
    const fields: string[] = []
    const values: any[] = []

    if (updates.clockIn !== undefined) { fields.push('clockIn = ?'); values.push(updates.clockIn) }
    if (updates.clockOut !== undefined) { fields.push('clockOut = ?'); values.push(updates.clockOut) }
    if (updates.breakStart !== undefined) { fields.push('breakStart = ?'); values.push(updates.breakStart) }
    if (updates.breakEnd !== undefined) { fields.push('breakEnd = ?'); values.push(updates.breakEnd) }
    if (updates.totalHours !== undefined) { fields.push('totalHours = ?'); values.push(updates.totalHours) }
    if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status) }
    if (updates.notes !== undefined) { fields.push('notes = ?'); values.push(updates.notes) }

    fields.push('updatedAt = datetime(\'now\')')
    values.push(recordId)

    const stmt = database.prepare(`UPDATE attendance_records SET ${fields.join(', ')} WHERE id = ?`)
    stmt.run(...values)
  } catch (error) {
    console.error('Error updating attendance record:', error)
    throw error
  }
}

// Leave Application Functions

export interface LeaveApplication {
  id: string
  userId: string
  leaveType: string
  startDate: string
  endDate: string
  days: number
  reason: string
  status: string
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
  createdAt?: string
  updatedAt?: string
}

export function createLeaveApplication(application: LeaveApplication): void {
  try {
    const database = getDb()
    const stmt = database.prepare(`
      INSERT INTO leave_applications (id, userId, leaveType, startDate, endDate, days, reason, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `)
    stmt.run(
      application.id,
      application.userId,
      application.leaveType,
      application.startDate,
      application.endDate,
      application.days,
      application.reason,
      application.status || 'pending'
    )
  } catch (error) {
    console.error('Error creating leave application:', error)
    throw error
  }
}

export function getLeaveApplicationsByUser(userId: string): LeaveApplication[] {
  try {
    const database = getDb()
    const stmt = database.prepare('SELECT * FROM leave_applications WHERE userId = ? ORDER BY createdAt DESC')
    const results = stmt.all(userId) as LeaveApplication[]
    return results || []
  } catch (error) {
    console.error('Error getting leave applications:', error)
    return []
  }
}

export function updateLeaveApplicationStatus(
  applicationId: string,
  status: string,
  approvedBy?: string,
  rejectionReason?: string
): void {
  try {
    const database = getDb()
    const stmt = database.prepare(`
      UPDATE leave_applications 
      SET status = ?, approvedBy = ?, approvedAt = ?, rejectionReason = ?, updatedAt = datetime('now')
      WHERE id = ?
    `)
    stmt.run(
      status,
      approvedBy || null,
      status === 'approved' ? new Date().toISOString() : null,
      rejectionReason || null,
      applicationId
    )
  } catch (error) {
    console.error('Error updating leave application status:', error)
    throw error
  }
}

// Close database connection (for cleanup)
export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}

