#!/usr/bin/env node

import db from '../lib/db'

console.log('🗄️  Database Status\n')
console.log('=' .repeat(40))

// Get counts
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get()['count']
const attendanceCount = db.prepare('SELECT COUNT(*) as count FROM attendance').get()['count']
const volumeLogsCount = db.prepare('SELECT COUNT(*) as count FROM volume_logs').get()['count']
const leaveAppsCount = db.prepare('SELECT COUNT(*) as count FROM leave_applications').get()['count']

console.log(`📊 Records:`)
console.log(`   Users: ${userCount}`)
console.log(`   Attendance Records: ${attendanceCount}`)
console.log(`   Volume Logs: ${volumeLogsCount}`)
console.log(`   Leave Applications: ${leaveAppsCount}`)
console.log()

if (userCount > 0) {
  console.log('👥 Registered Users:')
  const users = db.prepare('SELECT username, fullName, department FROM users').all() as any[]
  users.forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.fullName} (${user.username}) - ${user.department}`)
  })
}

console.log()
console.log('✅ Database is operational!')
console.log('📁 Database location: data/attendance.db')

process.exit(0)



