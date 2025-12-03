# SQLite Database Guide

## 📊 Database Overview

Your intern attendance system uses **SQLite** for data storage. The database file is located at `data/attendance.db`.

### Tables

1. **users** - Stores intern user accounts
2. **attendance** - Records clock in/out times and locations
3. **volume_logs** - Stores daily task logs
4. **leave_applications** - Tracks leave requests and approvals

## 🚀 Quick Commands

### Check Database Status
```bash
npm run db:status
```

### Initialize Database
```bash
npm run db:init
```

## 📁 Database File

**Location**: `data/attendance.db`

The database is automatically created when the application starts for the first time. It's already set up and ready to use.

## 🔍 Check Current Data

### View Database Statistics
```bash
npm run db:status
```

Output will show:
- Number of users
- Number of attendance records
- Number of volume logs
- Number of leave applications
- List of registered users

### Manual Database Access

You can also access the database directly using SQLite:

```bash
sqlite3 data/attendance.db
```

Then run SQL queries:

```sql
-- List all users
SELECT * FROM users;

-- List all attendance records
SELECT * FROM attendance;

-- List volume logs
SELECT * FROM volume_logs;

-- List leave applications
SELECT * FROM leave_applications;

-- Exit
.exit
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  fullName TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  department TEXT NOT NULL,
  emergencyContactName TEXT NOT NULL,
  emergencyContactPhone TEXT NOT NULL,
  phoneNumber TEXT NOT NULL,
  isPhoneVerified INTEGER DEFAULT 0,
  password TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### Attendance Table
```sql
CREATE TABLE attendance (
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
```

### Volume Logs Table
```sql
CREATE TABLE volume_logs (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  date TEXT NOT NULL,
  content TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### Leave Applications Table
```sql
CREATE TABLE leave_applications (
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
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

## 🛠️ Database Operations

### Create a User
Users are created through the signup page or API:
```
POST /api/auth/signup
```

### Query Users
```typescript
import { getUserByUsername, getUserById } from '@/lib/db-utils'

const user = getUserByUsername('testintern')
const userById = getUserById('user-id-here')
```

### Query Attendance
```typescript
import { getAttendanceByUser, getAttendanceByUserAndDate } from '@/lib/db-utils'

const records = getAttendanceByUser('user-id')
const todayRecord = getAttendanceByUserAndDate('user-id', '2024-01-15')
```

### Query Volume Logs
```typescript
import { getVolumeLogsByUser, getVolumeLogByUserAndDate } from '@/lib/db-utils'

const logs = getVolumeLogsByUser('user-id')
const todayLog = getVolumeLogByUserAndDate('user-id', '2024-01-15')
```

### Query Leave Applications
```typescript
import { getLeaveApplicationsByUser } from '@/lib/db-utils'

const applications = getLeaveApplicationsByUser('user-id')
```

## 💾 Backup Database

### Manual Backup
```bash
cp data/attendance.db data/attendance.db.backup
```

### Restore Backup
```bash
cp data/attendance.db.backup data/attendance.db
```

## 🔒 Security

1. **Password Hashing**: The `password` field stores plain passwords. In production, use bcrypt:
   ```typescript
   import bcrypt from 'bcryptjs'
   
   const hashedPassword = await bcrypt.hash(password, 10)
   ```

2. **Location**: Keep the database file secure and never commit it to git (already in `.gitignore`)

## 📈 Database Size

Check database size:
```bash
ls -lh data/attendance.db
```

## 🧹 Clean Database

⚠️ **Warning**: This will delete all data!

```bash
rm data/attendance.db
# Restart the app - it will recreate the database
npm run build && npx pm2 restart intern-attendance-system
```

## ✅ Current Status

Your database is already set up and operational. Check status:

```bash
npm run db:status
```

## 🎯 Next Steps

1. **Enable SMS**: Set up Twilio for phone verification (see TWILIO_SETUP_GUIDE.md)
2. **Add Users**: Create accounts via signup page
3. **Use the System**: Login and start using the attendance system

## 📞 Need Help?

- Check logs: `pm2 logs intern-attendance-system`
- View database: `sqlite3 data/attendance.db`
- Check status: `npm run db:status`



