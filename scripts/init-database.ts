#!/usr/bin/env node

import db from '../lib/db'
import crypto from 'crypto'

console.log('🗄️  Initializing Database...\n')

// Create a test user
const testUser = {
  id: crypto.randomUUID(),
  fullName: 'Test Intern',
  username: 'testintern',
  address: '123 Test Street, Kuala Lumpur',
  department: 'Unit Teknologi Maklumat',
  emergencyContactName: 'Parent Test',
  emergencyContactPhone: '0123456789',
  phoneNumber: '0198765432',
  isPhoneVerified: true,
  password: 'hashed_password_here' // In production, use bcrypt
}

try {
  const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get('testintern')
  
  if (existingUser) {
    console.log('✅ Database already initialized')
    console.log('📊 Current data:')
    console.log(`   Users: ${db.prepare('SELECT COUNT(*) FROM users').get()['COUNT(*)']}`)
    console.log(`   Attendance Records: ${db.prepare('SELECT COUNT(*) FROM attendance').get()['COUNT(*)']}`)
    console.log(`   Volume Logs: ${db.prepare('SELECT COUNT(*) FROM volume_logs').get()['COUNT(*)']}`)
    console.log(`   Leave Applications: ${db.prepare('SELECT COUNT(*) FROM leave_applications').get()['COUNT(*)']}`)
  } else {
    db.prepare(`
      INSERT INTO users (id, fullName, username, address, department, emergencyContactName, emergencyContactPhone, phoneNumber, isPhoneVerified, password)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      testUser.id,
      testUser.fullName,
      testUser.username,
      testUser.address,
      testUser.department,
      testUser.emergencyContactName,
      testUser.emergencyContactPhone,
      testUser.phoneNumber,
      1,
      testUser.password
    )
    
    console.log('✅ Test user created:')
    console.log(`   Username: ${testUser.username}`)
    console.log(`   Password: (use actual password in signup)`)
    console.log(`   Phone: ${testUser.phoneNumber}`)
    console.log('\n📊 Database Statistics:')
    console.log(`   Users: ${db.prepare('SELECT COUNT(*) FROM users').get()['COUNT(*)']}`)
  }
  
  console.log('\n✅ Database initialized successfully!')
  console.log('\n💡 To create more users, use the signup page at http://localhost:3000/signup')
  console.log('💡 Or use the API to create users programmatically')
  
} catch (error) {
  console.error('❌ Error initializing database:', error)
  process.exit(1)
}

process.exit(0)



