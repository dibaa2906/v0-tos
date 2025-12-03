# PM2 Auto-Start Setup Guide

This guide will help you set up your server to run automatically and stay available all the time.

## Quick Setup

Run the setup script:

```bash
npm run pm2:setup
```

Or manually:

```bash
./setup-pm2-autostart.sh
```

## Manual Setup Steps

### 1. Make sure your app is built

```bash
npm run build
```

### 2. Start the server with PM2

```bash
npm run pm2:start
```

### 3. Save the PM2 process list

```bash
npm run pm2:save
```

### 4. Enable auto-start on system boot

Run this command (you'll need to enter your password):

```bash
sudo env PATH=$PATH:/opt/homebrew/Cellar/node/24.8.0/bin /opt/homebrew/lib/node_modules/pm2/bin/pm2 startup launchd -u wanadiba --hp /Users/wanadiba
```

**Note:** The path might be different on your system. If the above doesn't work, run `pm2 startup` and it will give you the correct command for your system.

## Verify Setup

Check if PM2 is managing your server:

```bash
npm run pm2:status
```

You should see `intern-attendance-system` with status `online`.

## Useful Commands

- **View logs:** `npm run pm2:logs`
- **Check status:** `npm run pm2:status`
- **Restart server:** `npm run pm2:restart`
- **Stop server:** `npm run pm2:stop`
- **Start server:** `npm run pm2:start`

## How It Works

- **PM2** is a process manager that keeps your Node.js application running
- **Auto-restart:** If your app crashes, PM2 will automatically restart it
- **Auto-start on boot:** Once configured, PM2 will start your server automatically when your Mac boots up
- **Process persistence:** PM2 saves your process list, so even if PM2 restarts, your apps will be restored

## Troubleshooting

### Server keeps restarting

If you see a high restart count (↺ column), check the logs:

```bash
npm run pm2:logs
```

Look for error messages and fix the underlying issue.

### Server not starting on boot

1. Make sure you ran the `pm2 startup` command with sudo
2. Verify PM2 saved the process list: `pm2 save`
3. Check if PM2 startup script is installed: `pm2 unstartup` then `pm2 startup` again

### Check if server is accessible

```bash
curl http://localhost:3000
```

Or open your browser and go to `http://localhost:3000`

## Removing Auto-Start

If you want to disable auto-start on boot:

```bash
pm2 unstartup
```

This will remove the startup script but keep PM2 running your current processes.


