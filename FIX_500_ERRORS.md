# Fixing 500 Internal Server Errors 🔧

## Problem
Getting 500 errors for all JavaScript files (main.js, webpack.js, _app.js, etc.) when accessing the website.

## Root Causes Fixed

### 1. **Better-sqlite3 in Client Bundle** ✅
- **Issue**: `better-sqlite3` (Node.js-only) was being bundled for client-side
- **Fix**: Added webpack configuration to exclude Node.js modules from client bundles

### 2. **PDF Export SSR Issues** ✅  
- **Issue**: `jsPDF` was imported directly causing SSR problems
- **Fix**: Changed to dynamic import with browser check

### 3. **Database Error Handling** ✅
- **Issue**: Database connection errors weren't properly caught
- **Fix**: Added try-catch with better error messages

## Changes Made

### `next.config.mjs`
Added webpack configuration:
```js
webpack: (config, { isServer }) => {
  // Exclude better-sqlite3 and Node.js modules from client-side bundling
  if (!isServer) {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      path: false,
      os: false,
    };
    config.externals = config.externals || [];
    config.externals.push('better-sqlite3');
  }
  return config;
}
```

### `lib/pdf-export.ts`
- Changed to async function with dynamic import
- Added browser check before importing jsPDF
- Fixed jsPDF usage

### `lib/db-utils.ts`
- Added try-catch in `getDb()` function
- Better error messages for database connection failures

### `app/admin/logs/page.tsx`
- Fixed `getCurrentUser()` usage (removed .then() since it's not async)
- Made `handleExportPDF` async

## Next Steps

### On Your Server (VM):
```bash
cd /var/www/intern-attendance

# Pull latest changes
git pull origin dev02

# Rebuild native dependencies (important!)
npm install
npm rebuild better-sqlite3

# Rebuild app
npm run build

# Restart PM2
pm2 restart intern-attendance-system

# Check logs for errors
pm2 logs intern-attendance-system --lines 50
```

## If Errors Persist

### Check Database:
```bash
# Verify database file exists and has permissions
ls -la /var/www/intern-attendance/data/attendance.db

# If missing, create directory
mkdir -p /var/www/intern-attendance/data
chmod 755 /var/www/intern-attendance/data

# Check if database is locked
lsof /var/www/intern-attendance/data/attendance.db
```

### Check Environment Variables:
```bash
# Verify DATABASE_PATH is set correctly
cat /var/www/intern-attendance/.env | grep DATABASE_PATH

# Should be something like:
# DATABASE_PATH=/var/www/intern-attendance/data/attendance.db
```

### Verify Better-sqlite3:
```bash
# Check if native module is built
cd /var/www/intern-attendance
node -e "require('better-sqlite3')"

# If error, rebuild:
npm rebuild better-sqlite3
```

## Common Issues

### Issue: "Module not found: better-sqlite3"
**Solution**: `npm install better-sqlite3` and `npm rebuild better-sqlite3`

### Issue: "Database is locked"
**Solution**: Check if multiple processes are accessing the database. Restart PM2.

### Issue: "Permission denied"
**Solution**: 
```bash
sudo chown -R $USER:$USER /var/www/intern-attendance
chmod 755 /var/www/intern-attendance/data
```

### Issue: Still getting 500 errors
**Check PM2 logs**:
```bash
pm2 logs intern-attendance-system --err
```

The actual error message will tell you what's wrong!

