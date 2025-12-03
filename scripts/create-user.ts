import { createUser } from '../lib/db-utils'

const adminUser = {
  id: 'admin-' + Date.now().toString(),
  fullName: 'Admin User',
  username: 'admin',
  email: 'admin@example.com',
  address: '123 Admin HQ, KL',
  department: 'Unit Teknologi Maklumat',
  emergencyContactName: 'Super Admin',
  emergencyContactPhone: '0100000111',
  isPhoneVerified: true,
  password: 'adminpass1',
  isAdmin: true
}

try {
  createUser(adminUser)
  console.log('✅ Admin user created successfully!')
  console.log('\nLogin credentials:')
  console.log('Username:', adminUser.username)
  console.log('Password:', adminUser.password)
  console.log('Email:', adminUser.email)
  console.log('\nLogin at: http://localhost:3000/login')
} catch (error) {
  console.error('❌ Error creating admin user:', error)
}


