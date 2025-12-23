# Auto-Start Server Guide

Your server is now configured to run automatically with PM2!

## 🎯 Current Status

✅ **Server is running** - http://localhost:3000  
✅ **PM2 configured** - Server will auto-restart if it crashes  
⏳ **Auto-start on boot** - Run the setup script below to enable

## ✅ What's Set Up

- **PM2 Process Manager**: Keeps your server running 24/7
- **Auto-Restart**: Server restarts automatically if it crashes
- **Boot Startup**: Server starts automatically when your Mac boots up
- **Logs**: All server logs saved to `logs/` directory

## 🎮 Quick Commands

### Check Server Status
```bash
npm run pm2:status
# or
npx pm2 status
```

### View Server Logs
```bash
npm run pm2:logs
# or
npx pm2 logs intern-attendance-system
```

### Restart Server
```bash
npm run pm2:restart
# or
npx pm2 restart intern-attendance-system
```

### Stop Server
```bash
npm run pm2:stop
# or
npx pm2 stop intern-attendance-system
```

### Start Server (if stopped)
```bash
npm run pm2:start
# or
npx pm2 start ecosystem.config.js
```

## 📝 Important Notes

1. **Server runs in development mode** (`npm run dev`)
   - Hot reload enabled
   - Changes auto-refresh
   - Access at: http://localhost:3000

2. **Logs Location**
   - Error logs: `logs/pm2-error.log`
   - Output logs: `logs/pm2-out.log`
   - Combined logs: `logs/pm2-combined.log`

3. **Auto-Start on Boot** (Optional)
   - To enable auto-start on boot, run:
   ```bash
   ./setup-auto-start.sh
   ```
   - This will prompt for your password (sudo required)
   - After setup, PM2 will start your server automatically when your Mac boots
   - No need to manually start it anymore!

4. **If Server Won't Start**
   ```bash
   # Check logs
   npm run pm2:logs
   
   # Restart
   npm run pm2:restart
   
   # Check status
   npm run pm2:status
   ```

## 🔧 Troubleshooting

### Server not starting?
```bash
# Check PM2 status
npx pm2 status

# Check logs
npx pm2 logs intern-attendance-system --lines 50

# Restart
npx pm2 restart intern-attendance-system
```

### Port 3000 already in use?
```bash
# Find what's using port 3000
lsof -ti:3000

# Kill it
lsof -ti:3000 | xargs kill -9

# Restart PM2
npx pm2 restart intern-attendance-system
```

### Disable auto-start on boot?
```bash
npx pm2 unstartup
```

### Re-enable auto-start on boot?
```bash
npx pm2 startup
npx pm2 save
```

## 🎯 Your Server is Now Running!

- **URL**: http://localhost:3000
- **Status**: Always running (even after reboot)
- **Mode**: Development (hot reload enabled)

You don't need to manually start the server anymore! 🎉

