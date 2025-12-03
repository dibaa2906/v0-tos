const Database = require('better-sqlite3')
const path = require('path')
const dbPath = path.join(process.cwd(), 'data', 'attendance.db')
const db = new Database(dbPath)

console.log('🔄 Removing foreign key constraint from leave_applications table...')

try {
  // Check if foreign key exists
  const fkCheck = db.prepare("PRAGMA foreign_key_list(leave_applications)").all()
  
  if (fkCheck.length > 0) {
    console.log('Foreign key constraint found, recreating table...')
    
    // Drop new table if it exists from previous attempt
    db.exec('DROP TABLE IF EXISTS leave_applications_new')
    
    // Create new table without foreign key
    db.exec(`
      CREATE TABLE leave_applications_new (
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
    `)
    
    // Copy data
    db.exec(`
      INSERT INTO leave_applications_new 
      SELECT id, userId, startDate, endDate, reason, status, appliedAt, 
             supervisorApprovedAt, hodApprovedAt, rejectedAt, rejectedBy, 
             reviewerNote, supervisorRejectedAt, supervisorRejectedBy
      FROM leave_applications;
    `)
    
    // Drop old table and rename new one
    db.exec(`
      DROP TABLE leave_applications;
      ALTER TABLE leave_applications_new RENAME TO leave_applications;
      CREATE INDEX IF NOT EXISTS idx_leave_applications_user ON leave_applications(userId);
    `)
    
    console.log('✅ Successfully removed foreign key constraint')
  } else {
    console.log('✅ No foreign key constraint found')
  }
} catch (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}

db.close()
console.log('Done!')

