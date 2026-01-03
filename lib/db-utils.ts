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

// Close database connection (for cleanup)
export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}

