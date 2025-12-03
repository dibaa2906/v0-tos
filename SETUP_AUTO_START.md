# Auto-Start Setup Instructions

Your server is already running with PM2. To make it start automatically when your Mac boots up, follow these steps:

## Step 1: Enable PM2 Startup Script

Run this command in your terminal (you'll need to enter your password):

```bash
sudo env PATH=$PATH:/opt/homebrew/Cellar/node/24.8.0/bin /opt/homebrew/lib/node_modules/pm2/bin/pm2 startup launchd -u wanadiba --hp /Users/wanadiba
```

This will create a launchd service that starts PM2 automatically on boot.

## Step 2: Verify Setup

After running the command above, verify that PM2 will start on boot:

```bash
pm2 startup
```

You should see a message confirming the startup script is installed.

## Step 3: Save Current PM2 Processes

Make sure your current PM2 processes are saved:

```bash
pm2 save
```

## That's it! 

Your server will now:
- ✅ Start automatically when your Mac boots up
- ✅ Restart automatically if it crashes
- ✅ Keep running in the background

## Useful Commands

- **View logs**: `npm run pm2:logs` or `pm2 logs intern-attendance-system`
- **Restart server**: `npm run pm2:restart` or `pm2 restart intern-attendance-system`
- **Stop server**: `npm run pm2:stop` or `pm2 stop intern-attendance-system`
- **Check status**: `npm run pm2:status` or `pm2 status`
- **View all logs**: `pm2 logs`

## To Disable Auto-Start Later

If you want to disable auto-start:

```bash
pm2 unstartup
```

