# Fix Database Lock Issues

## Quick Fix

If you see "database is locked" errors:

1. **Close DB Browser** (if you have it open):
   ```bash
   # Find and close DB Browser
   pkill -f "DB Browser"
   ```

2. **Restart the server**:
   ```bash
   npm run pm2:restart
   ```

3. **Check what's accessing the database**:
   ```bash
   lsof data/attendance.db
   ```

## What Was Fixed

1. **Increased timeout**: Database now waits 10 seconds for locks to clear
2. **WAL mode enabled**: Allows multiple readers simultaneously
3. **Better error handling**: Database operations handle locks more gracefully

## Prevention

- **Don't open the database in DB Browser while the server is running**
- If you need to view the database:
  1. Stop the server: `npm run pm2:stop`
  2. Open in DB Browser
  3. Close DB Browser
  4. Start the server: `npm run pm2:start`

## If Lock Persists

1. Check for stale processes:
   ```bash
   lsof data/attendance.db
   ```

2. Kill any processes holding the lock (except your server):
   ```bash
   kill <PID>
   ```

3. Restart server:
   ```bash
   npm run pm2:restart
   ```




