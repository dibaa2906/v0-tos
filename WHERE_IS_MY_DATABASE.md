# 📁 Where is My Database?

## 🎯 Database Location

Your database file is located at:

```
/Users/wanadiba/v0-tos/data/attendance.db
```

Or relative to your project:
```
./data/attendance.db
```

## ✅ Current Status

✅ Database exists (52 KB)
✅ Contains 1 test user
✅ All tables created and ready

### Quick View Database

```bash
# View database statistics and users
./view-database.sh

# Or use the npm script
npm run db:status
```

## 📊 What's in Your Database

- **Users**: 1 (testintern)
- **Attendance Records**: 0
- **Volume Logs**: 0  
- **Leave Applications**: 0

## 🔍 How to View Your Database

### Option 1: Use the View Script

```bash
./view-database.sh
```

### Option 2: Use Terminal (SQLite CLI)

```bash
# Open database
sqlite3 data/attendance.db

# Then run SQL queries:
.tables
SELECT * FROM users;
.exit
```

### Option 3: Use a Visual Tool

Install DB Browser for SQLite (free):

```bash
# Using Homebrew
brew install --cask db-browser-for-sqlite
```

Then open the database:
```
File > Open Database > /Users/wanadiba/v0-tos/data/attendance.db
```

Or install TablePlus:
```bash
brew install --cask tableplus
```

## 📁 Project Structure

```
/Users/wanadiba/v0-tos/
├── data/
│   └── attendance.db          ← YOUR DATABASE IS HERE
├── app/
├── components/
├── lib/
│   ├── db.ts                  ← Database setup
│   └── db-utils.ts            ← Database functions
└── scripts/
    ├── init-database.ts
    └── check-database.ts
```

## 🗄️ Database Commands

```bash
# Check status
npm run db:status
./view-database.sh

# View in terminal
sqlite3 data/attendance.db

# Open with visual tool
open data/attendance.db  # Will open with default SQLite viewer (if installed)
```

## ✅ Your Database is Ready!

The database is already created and working. You have:
- 1 test user registered
- All tables created (users, attendance, volume_logs, leave_applications)
- Database functions ready to use

### Next Steps:

1. ✅ Database exists and is working
2. 👥 Create user accounts via signup page
3. 📱 Set up SMS (see SMS_SETUP_NOW.md)
4. 🚀 Start using the system!

## 🆘 Troubleshooting

### "Database not found"

The database is automatically created when the app starts. If you don't see it:

```bash
# The database is in:
ls -lh data/attendance.db

# If it doesn't exist, restart the app:
npm run build && npx pm2 restart intern-attendance-system
```

### "Permission denied"

```bash
chmod +x view-database.sh
./view-database.sh
```

### Want to reset the database?

```bash
# Delete the database (all data will be lost!)
rm data/attendance.db

# Rebuild and restart - database will be recreated
npm run build && npx pm2 restart intern-attendance-system
```



