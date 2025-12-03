import Database from 'better-sqlite3'
import path from 'path'

// Use Railway's data directory or fallback to local data directory
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'attendance.db')

// Ensure data directory exists
const fs = require('fs')
const dataDir = path.dirname(dbPath)
try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
} catch (error) {
  console.warn('Could not create data directory:', error)
  // Continue anyway - might be in read-only filesystem
}

const db = new Database(dbPath, {
  timeout: 5000 // Wait up to 5 seconds for locks to clear (reduced from 10s)
})

// Enable foreign keys with error handling
try {
  db.pragma('foreign_keys = ON')
} catch (e: any) {
  if (e?.code !== 'SQLITE_BUSY') {
    console.warn('Could not enable foreign keys:', e)
  }
}

// Create tables with error handling (non-blocking)
let dbInitialized = false
try {
  db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    department TEXT NOT NULL,
    emergencyContactName TEXT NOT NULL,
    emergencyContactPhone TEXT NOT NULL,
    phoneNumber TEXT NOT NULL,
    isPhoneVerified INTEGER DEFAULT 0,
    password TEXT NOT NULL,
    profilePhoto TEXT,
    isAdmin INTEGER DEFAULT 0,
    isActive INTEGER DEFAULT 1,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Add profilePhoto column if it doesn't exist
  PRAGMA table_info(users);
  CREATE TABLE IF NOT EXISTS schema_info (version INTEGER);
  INSERT OR IGNORE INTO schema_info (version) VALUES (1);

  -- Create index on username for faster login lookups
  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

  -- Attendance records table
  CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    date TEXT NOT NULL,
    clockInTime TEXT,
    clockOutTime TEXT,
    clockInImage TEXT,
    clockOutImage TEXT,
    clockInLatitude REAL,
    clockInLongitude REAL,
    clockOutLatitude REAL,
    clockOutLongitude REAL,
    status TEXT NOT NULL DEFAULT 'absent',
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  -- Create index for faster lookups
  CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance(userId, date);

  -- Volume logs table (foreign key removed to avoid mismatch with users table schema)
  CREATE TABLE IF NOT EXISTS volume_logs (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    date TEXT NOT NULL,
    content TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Create index for faster lookups
  CREATE INDEX IF NOT EXISTS idx_volume_logs_user_date ON volume_logs(userId, date);

  -- Leave applications table
  CREATE TABLE IF NOT EXISTS leave_applications (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    appliedAt TEXT NOT NULL DEFAULT (datetime('now')),
    supervisorApprovedAt TEXT,
    hodApprovedAt TEXT,
    rejectedAt TEXT,
    rejectedBy TEXT,
    reviewerNote TEXT
  );

  -- Add reviewerNote column if it doesn't exist (for existing databases)
  CREATE TABLE IF NOT EXISTS _temp_leave_applications (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    appliedAt TEXT NOT NULL DEFAULT (datetime('now')),
    supervisorApprovedAt TEXT,
    hodApprovedAt TEXT,
    rejectedAt TEXT,
    rejectedBy TEXT,
    reviewerNote TEXT,
    FOREIGN KEY (userId) REFERENCES users(id)
  );
  
  -- Check if reviewerNote column exists, if not add it
  PRAGMA table_info(leave_applications);

  -- Create index for faster lookups
  CREATE INDEX IF NOT EXISTS idx_leave_applications_user ON leave_applications(userId);

  -- Notifications table
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    userId TEXT,
    targetUserId TEXT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    isRead INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    metadata TEXT,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (targetUserId) REFERENCES users(id)
  );

  -- Create indexes for faster lookups
  CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(userId);
  CREATE INDEX IF NOT EXISTS idx_notifications_target ON notifications(targetUserId);
  CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(isRead);
`)
  dbInitialized = true
} catch (e: any) {
  // If database is locked, tables likely already exist, so this is OK
  if (e?.code === 'SQLITE_BUSY' || e?.message?.includes('database is locked')) {
    console.warn('⚠️ Database is locked during initialization. Tables may already exist.')
    dbInitialized = true // Assume tables exist if locked
  } else {
    console.error('Database initialization error:', e)
  }
}

// Migration: Add missing columns if they don't exist (only if DB was initialized or is available)
// Cache migration status to avoid running on every import
let migrationsRun = false
try {
  if (!dbInitialized) {
    // Try to check if we can access the database
    db.prepare('SELECT 1').get()
  }
  
  // Only run migrations once per process
  if (!migrationsRun) {
    migrationsRun = true
    // Add reviewerNote, supervisorRejectedAt, supervisorRejectedBy to leave_applications
    const leaveTableInfo = db.prepare("PRAGMA table_info(leave_applications)").all() as any[]
    const hasReviewerNote = leaveTableInfo.some(col => col.name === 'reviewerNote')
  const hasSupervisorRejectedAt = leaveTableInfo.some(col => col.name === 'supervisorRejectedAt')
  const hasSupervisorRejectedBy = leaveTableInfo.some(col => col.name === 'supervisorRejectedBy')
  const hasMcFile = leaveTableInfo.some(col => col.name === 'mcFile')
  const hasLeaveType = leaveTableInfo.some(col => col.name === 'leaveType')
  
  if (!hasReviewerNote) {
    db.exec('ALTER TABLE leave_applications ADD COLUMN reviewerNote TEXT')
    console.log('✅ Added reviewerNote column to leave_applications table')
  }
  
  if (!hasSupervisorRejectedAt) {
    db.exec('ALTER TABLE leave_applications ADD COLUMN supervisorRejectedAt TEXT')
    console.log('✅ Added supervisorRejectedAt column to leave_applications table')
  }
  
  if (!hasSupervisorRejectedBy) {
    db.exec('ALTER TABLE leave_applications ADD COLUMN supervisorRejectedBy TEXT')
    console.log('✅ Added supervisorRejectedBy column to leave_applications table')
  }

  if (!hasMcFile) {
    db.exec('ALTER TABLE leave_applications ADD COLUMN mcFile TEXT')
    console.log('✅ Added mcFile column to leave_applications table')
  }

  if (!hasLeaveType) {
    db.exec('ALTER TABLE leave_applications ADD COLUMN leaveType TEXT DEFAULT "regular"')
    console.log('✅ Added leaveType column to leave_applications table')
  }

  // Add isAdmin and isActive to users
  const usersTableInfo = db.prepare("PRAGMA table_info(users)").all() as any[]
  const hasIsAdmin = usersTableInfo.some(col => col.name === 'isAdmin')
  const hasIsActive = usersTableInfo.some(col => col.name === 'isActive')
  const hasEmail = usersTableInfo.some(col => col.name === 'email')
  const hasPhoneNumber = usersTableInfo.some(col => col.name === 'phoneNumber')
  const hasInstitution = usersTableInfo.some(col => col.name === 'institution')
  const hasLecturerContactName = usersTableInfo.some(col => col.name === 'lecturerContactName')
  const hasLecturerContactPhone = usersTableInfo.some(col => col.name === 'lecturerContactPhone')
  
  if (!hasIsAdmin) {
    db.exec('ALTER TABLE users ADD COLUMN isAdmin INTEGER DEFAULT 0')
    console.log('✅ Added isAdmin column to users table')
  }
  
  if (!hasIsActive) {
    db.exec('ALTER TABLE users ADD COLUMN isActive INTEGER DEFAULT 1')
    console.log('✅ Added isActive column to users table')
  }
  
  if (!hasEmail) {
    db.exec('ALTER TABLE users ADD COLUMN email TEXT')
    console.log('✅ Added email column to users table')
  }
  
  if (!hasPhoneNumber) {
    db.exec('ALTER TABLE users ADD COLUMN phoneNumber TEXT')
    console.log('✅ Added phoneNumber column to users table')
  }

  if (!hasInstitution) {
    db.exec('ALTER TABLE users ADD COLUMN institution TEXT')
    console.log('✅ Added institution column to users table')
  }

  if (!hasLecturerContactName) {
    db.exec('ALTER TABLE users ADD COLUMN lecturerContactName TEXT')
    console.log('✅ Added lecturerContactName column to users table')
  }

  if (!hasLecturerContactPhone) {
    db.exec('ALTER TABLE users ADD COLUMN lecturerContactPhone TEXT')
    console.log('✅ Added lecturerContactPhone column to users table')
  }

  // Create verification_codes table if it doesn't exist
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS verification_codes (
        email TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        expiresAt INTEGER NOT NULL,
        createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
      );
      CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
      CREATE INDEX IF NOT EXISTS idx_verification_codes_expiresAt ON verification_codes(expiresAt);
    `)
    console.log('✅ Created verification_codes table')
  } catch (e: any) {
    if (e?.code !== 'SQLITE_BUSY') {
      console.error('Error creating verification_codes table:', e)
    }
  }

  // Check if notifications table exists
  const notificationsTableInfo = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='notifications'").get()
  if (!notificationsTableInfo) {
    db.exec(`
      CREATE TABLE notifications (
        id TEXT PRIMARY KEY,
        userId TEXT,
        targetUserId TEXT,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        isRead INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        metadata TEXT,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (targetUserId) REFERENCES users(id)
      );
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(userId);
      CREATE INDEX IF NOT EXISTS idx_notifications_target ON notifications(targetUserId);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(isRead);
    `)
    console.log('✅ Created notifications table')
  }

  // Remove foreign key constraint from leave_applications if it exists
  try {
    const fkCheck = db.prepare("PRAGMA foreign_key_list(leave_applications)").all() as any[]
    if (fkCheck.length > 0) {
      // Foreign key exists, recreate table without it
      console.log('🔄 Removing foreign key constraint from leave_applications table...')
      db.exec(`
        CREATE TABLE IF NOT EXISTS leave_applications_new (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          startDate TEXT NOT NULL,
          endDate TEXT NOT NULL,
          reason TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          appliedAt TEXT NOT NULL DEFAULT (datetime('now')),
          supervisorApprovedAt TEXT,
          hodApprovedAt TEXT,
          rejectedAt TEXT,
          rejectedBy TEXT,
          reviewerNote TEXT,
          supervisorRejectedAt TEXT,
          supervisorRejectedBy TEXT
        );
        INSERT INTO leave_applications_new 
        SELECT id, userId, startDate, endDate, reason, status, appliedAt, 
               supervisorApprovedAt, hodApprovedAt, rejectedAt, rejectedBy, 
               reviewerNote, supervisorRejectedAt, supervisorRejectedBy
        FROM leave_applications;
        DROP TABLE leave_applications;
        ALTER TABLE leave_applications_new RENAME TO leave_applications;
        CREATE INDEX IF NOT EXISTS idx_leave_applications_user ON leave_applications(userId);
      `)
      console.log('✅ Removed foreign key constraint from leave_applications table')
    }
  } catch (error: any) {
    if (error?.code !== 'SQLITE_BUSY') {
      console.error('Error removing foreign key constraint:', error)
    }
    // Don't fail if this migration fails
  }
  }
} catch (error: any) {
  if (error?.code !== 'SQLITE_BUSY') {
    console.error('Error checking/adding columns:', error)
  }
  // Don't fail if migrations can't run - tables may already be up to date
}

export default db
