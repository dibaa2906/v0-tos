# Quick Start Guide

## One-Time Setup (Only need to do this once!)

### Step 1: Run the Setup Script

**On Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**On Windows:**
Double-click `setup.bat` or run from command prompt:
```bash
setup.bat
```

This will automatically:
1. ✅ Install all required dependencies
2. ✅ Build the application
3. ✅ Start the server in the background
4. ✅ Configure it to start automatically when you turn on your computer

### Step 2: Access the Application

Open your browser and go to:
```
http://localhost:3000
```

That's it! The server will now run automatically whenever your computer is on.

## No Need to Start Server Manually!

Once you've run the setup script, the server will:
- ✅ Start automatically when you boot your computer
- ✅ Restart automatically if it crashes
- ✅ Run in the background (you won't see any terminal)
- ✅ Always be available at http://localhost:3000

## Useful Commands (Only if needed)

If you ever need to control the server:

```bash
# Check if server is running
npx pm2 status

# View what the server is doing
npx pm2 logs

# Restart the server (if needed)
npx pm2 restart ecosystem.config.js

# Stop the server temporarily
npx pm2 stop ecosystem.config.js

# Start the server again
npx pm2 start ecosystem.config.js
```

## Troubleshooting

### Server won't start?
1. Make sure you've run the setup script first
2. Check if port 3000 is already in use
3. Run `npx pm2 logs` to see error messages

### Can't access the website?
1. Make sure the server is running: `npx pm2 status`
2. Try restarting: `npx pm2 restart ecosystem.config.js`
3. Check the logs: `npx pm2 logs`

### Want to stop the auto-start?
```bash
npx pm2 unstartup
```

### Want to completely remove PM2?
```bash
npx pm2 delete all
npx pm2 kill
```

## Creating Your First Account

1. Go to http://localhost:3000
2. Click "Sign Up"
3. Fill in all the information:
   - Full Name
   - Username (unique)
   - Address
   - Department (select from dropdown)
   - Emergency Contact Name and Phone
   - Your Phone Number
   - Password
4. You'll receive a verification code (for demo, check the notification)
5. Enter the verification code
6. Your account is created!
7. Login with your username and password

## Need Help?

If you have any issues, check:
- `logs/pm2-error.log` for error messages
- `logs/pm2-out.log` for server output
- The terminal where you ran the setup script


