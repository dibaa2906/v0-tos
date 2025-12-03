#!/bin/bash

# Database Viewer - Quick access to your SQLite database

DB_PATH="data/attendance.db"

echo "🗄️  Intern Attendance System - Database Viewer"
echo "=" | tr '=' '-' | head -c 50 && echo

echo ""
echo "📁 Database Location: $(pwd)/$DB_PATH"
echo ""

if [ ! -f "$DB_PATH" ]; then
    echo "❌ Database not found at: $DB_PATH"
    exit 1
fi

# Show database info
echo "📊 Database Statistics:"
echo ""

sqlite3 "$DB_PATH" << 'EOF'
SELECT 'Users: ' || COUNT(*) FROM users;
SELECT 'Attendance Records: ' || COUNT(*) FROM attendance;
SELECT 'Volume Logs: ' || COUNT(*) FROM volume_logs;
SELECT 'Leave Applications: ' || COUNT(*) FROM leave_applications;
EOF

echo ""
echo ""

# Show users
echo "👥 Registered Users:"
echo ""
sqlite3 "$DB_PATH" << 'EOF'
.mode column
.headers on
SELECT 
    username as "Username",
    fullName as "Name", 
    department as "Department",
    phoneNumber as "Phone",
    datetime(createdAt) as "Created"
FROM users;
EOF

echo ""
echo ""
echo "💾 To view/edit the database manually:"
echo "   sqlite3 data/attendance.db"
echo ""
echo "Or use a visual tool like:"
echo "   - DB Browser for SQLite (https://sqlitebrowser.org/)"
echo "   - TablePlus (https://tableplus.com/)"
echo "   - DBeaver (https://dbeaver.io/)"
echo ""



