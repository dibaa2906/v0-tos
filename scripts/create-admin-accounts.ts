#!/usr/bin/env tsx

import db from '../lib/db'
import { getUserByUsername, getNextUserId } from '../lib/db-utils'

type AdminSeed = {
  fullName: string
  department: string
  username: string
  email: string
  phoneNumber: string
  password: string
  address?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
}

const DEFAULT_ADDRESS = 'Langkawi Port HQ, Kuah, Langkawi, Kedah'
const DEFAULT_EMERGENCY_CONTACT = {
  name: 'HR Command Center',
  phone: '0115500000'
}

const adminSeeds: AdminSeed[] = [
  {
    fullName: 'Shap Bin Hashim',
    department: 'Pentadbiran',
    username: 'shap.hashim',
    email: 'shap.hashim@langkawiport.com',
    phoneNumber: '0117000101',
    password: 'Emerald@2024'
  },
  {
    fullName: 'Shamsul Nizam Bin Shaari',
    department: 'Keselamatan dan Kesihatan',
    username: 'shamsul.shaari',
    email: 'shamsul.shaari@langkawiport.com',
    phoneNumber: '0117000102',
    password: 'Emerald@2024'
  },
  {
    fullName: 'Anuar Bin Mansor',
    department: 'Teknikal dan Penyelenggaraan',
    username: 'anuar.mansor',
    email: 'anuar.mansor@langkawiport.com',
    phoneNumber: '0117000103',
    password: 'Emerald@2024'
  },
  {
    fullName: 'Azmarina Binti Abd Aziz',
    department: 'Kewangan',
    username: 'azmarina.aziz',
    email: 'azmarina.aziz@langkawiport.com',
    phoneNumber: '0117000104',
    password: 'Emerald@2024'
  },
  {
    fullName: 'Engku Zamrin Bin Engku Embong',
    department: 'Operasi',
    username: 'engku.zamrin',
    email: 'engku.zamrin@langkawiport.com',
    phoneNumber: '0117000105',
    password: 'Emerald@2024'
  },
  {
    fullName: 'Muhamad Nasarudin Bin Roslan',
    department: 'Unit Teknologi Maklumat',
    username: 'nasarudin.roslan',
    email: 'nasarudin.roslan@langkawiport.com',
    phoneNumber: '0117000106',
    password: 'Emerald@2024'
  }
]

const insertAdmin = db.prepare(`
  INSERT INTO users (
    id,
    fullName,
    username,
    email,
    address,
    department,
    emergencyContactName,
    emergencyContactPhone,
    phoneNumber,
    isPhoneVerified,
    password,
    profilePhoto,
    isAdmin,
    isActive
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
`)

type Result = {
  fullName: string
  username: string
  password: string
  status: 'created' | 'skipped'
  reason?: string
}

const results: Result[] = []

for (const seed of adminSeeds) {
  const existing = getUserByUsername(seed.username)
  if (existing) {
    results.push({
      fullName: seed.fullName,
      username: seed.username,
      password: seed.password,
      status: 'skipped',
      reason: 'username already exists'
    })
    continue
  }

  const userId = getNextUserId()
  insertAdmin.run(
    userId,
    seed.fullName,
    seed.username,
    seed.email,
    seed.address ?? DEFAULT_ADDRESS,
    seed.department,
    seed.emergencyContactName ?? DEFAULT_EMERGENCY_CONTACT.name,
    seed.emergencyContactPhone ?? DEFAULT_EMERGENCY_CONTACT.phone,
    seed.phoneNumber,
    1,
    seed.password,
    null
  )

  results.push({
    fullName: seed.fullName,
    username: seed.username,
    password: seed.password,
    status: 'created'
  })
}

console.log('\n✅ Admin account seeding complete.\n')
console.table(results)
console.log('\nRemember to share credentials securely and ask admins to update their passwords after first login.\n')


