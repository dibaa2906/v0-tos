# Intern Attendance System

A comprehensive web-based attendance tracking system for interns with features including clock in/out, attendance history, leave management, and volume logs.

## Features

### User Authentication
- **Sign Up**: Create account with full name, username, address, department assignment, emergency contact, and phone verification
- **Login**: Secure authentication with username and password
- **Phone Verification**: SMS-based verification code system
- **Profile Management**: View and update profile information

### Attendance Management
- **Clock In/Out**: Record attendance with photo verification
- **Location Verification**: Geolocation tracking ensures attendance is recorded from authorized locations only
- **Camera Integration**: Photo capture required for both clock in and clock out
- **Status Tracking**: Automatic detection of on-time (before 8:00 AM) vs late arrivals
- **Attendance History**: View complete attendance records with status indicators

### Volume Logs
- **Daily Logs**: Write and track daily tasks and activities
- **Time-based Access**: Only accessible between 8 AM - 7 PM
- **Read-only Past Logs**: Previous logs can be viewed but not edited
- **Daily Fresh Log**: New log entry available each day

### Leave Management
- **Leave Application**: Submit leave requests with dates and reason
- **Approval Workflow**: Two-stage approval process (Supervisor → Head of Department)
- **Status Tracking**: Monitor application status through approval stages
- **Application History**: View all previous leave applications

### Dashboard
- **Overview**: Quick view of today's attendance status
- **Statistics**: Weekly and monthly attendance summaries
- **Quick Actions**: Easy access to frequently used features
- **Department Information**: Display assigned department and intern details

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Database**: SQLite with better-sqlite3
- **Styling**: Tailwind CSS with custom turquoise theme
- **UI Components**: Radix UI components
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React hooks and database
- **Icons**: Lucide React
- **Process Manager**: PM2 for auto-start and background operation

## Database

The application uses SQLite database for data persistence. The database file is automatically created at `data/attendance.db` when you first start the application.

### Database Schema

The database includes the following tables:

1. **users** - Stores intern user information
2. **attendance** - Records clock in/out data with timestamps and location
3. **volume_logs** - Stores daily work logs
4. **leave_applications** - Tracks leave requests and approvals

All tables include proper indexes for fast queries and foreign key relationships for data integrity.

### Database Backup

To backup your database:
```bash
cp data/attendance.db data/attendance_backup_$(date +%Y%m%d).db
```

To restore from backup:
```bash
cp data/attendance_backup_YYYYMMDD.db data/attendance.db
```

## Departments

The system supports five departments:
1. Pentadbiran (Administration)
2. Kewangan (Finance)
3. Teknikal dan Penyelenggaraan (Technical and Maintenance)
4. Keselamatan dan Kesihatan (Safety and Health)
5. Unit Teknologi Maklumat (Information Technology Unit)

## Getting Started

### Quick Setup (Recommended - Auto-start Server)

The easiest way to get started is to run the setup script which will:
- Install all dependencies
- Build the application
- Start the server with PM2 (runs automatically in background)
- Configure PM2 to auto-start on system boot

**On Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**On Windows:**
```bash
setup.bat
```

After running the setup script, your server will be running at [http://localhost:3000](http://localhost:3000) and will automatically start every time you restart your computer!

### Manual Setup (Alternative)

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Build the Application**
   ```bash
   pnpm build
   ```

3. **Start Production Server**
   ```bash
   pnpm start
   ```

4. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### First Time Usage

1. **Sign Up**
   - Click "Sign Up" on the homepage
   - Fill in all required information
   - Complete phone verification with the demo code
   - Login with your username and password

### Managing the Server

If you used the setup script with PM2, you can control the server using these commands:

```bash
# View server status
npx pm2 status

# View logs
npx pm2 logs

# Restart server
npx pm2 restart ecosystem.config.js

# Stop server
npx pm2 stop ecosystem.config.js

# Start server
npx pm2 start ecosystem.config.js
```

## Key Features Explained

### Attendance Rules
- Clock in before 8:00 AM = On Time
- Clock in after 8:00 AM = Late
- Location must be within 100 meters of the configured office location
- Photo required for both clock in and clock out

### Volume Logs
- Only accessible between 8 AM - 7 PM
- One log entry per day
- Current day's log is editable
- Previous logs are read-only

### Leave Application Flow
1. Intern submits leave application
2. Pending → awaiting supervisor approval
3. Approved by Supervisor → awaiting final review by Encik Shap
4. Approved by Encik Shap → approved
5. Rejected at any stage by supervisor or final reviewer

## UI Theme

The application uses a beautiful turquoise color scheme throughout:
- Primary actions and highlights use turquoise shades
- Gradient backgrounds create a modern, professional look
- Clean, intuitive sidebar navigation
- Responsive design for mobile and desktop

## Development

Built with modern web technologies and best practices:
- Type-safe with TypeScript
- Component-based architecture
- Responsive design
- Accessible UI components
- Client-side state management

## License

This project is private and proprietary.

## Deployment

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)