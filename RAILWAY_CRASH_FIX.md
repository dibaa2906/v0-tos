# Fix Railway Crash - "ELIFECYCLE Command failed"

## What I Fixed

1. ✅ **Created `server.js`** - Custom server that handles Railway's dynamic PORT
2. ✅ **Updated `package.json`** - Changed start command to use custom server
3. ✅ **Updated `lib/db.ts`** - Made database path configurable for Railway
4. ✅ **Made database directory creation resilient** - Won't crash if directory can't be created

## Next Steps

### 1. Push Changes to GitHub
```bash
git add .
git commit -m "Fix Railway deployment"
git push origin main
```

### 2. In Railway Dashboard

1. **Go to:** https://railway.app
2. **Click your project**
3. **Go to "Variables" tab**
4. **Add/Verify these environment variables:**
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_PATH=/tmp/attendance.db
   GMAIL_USER=your-email@gmail.com
   GMAIL_PASS=your-app-password
   ```

### 3. Create Volume for Database (Recommended)

Railway's filesystem is ephemeral. Create a volume:

1. **Railway dashboard** → Your service
2. **Settings** → **"Volumes"**
3. **Create Volume** → Name: `data`, Mount Path: `/data`
4. **Update environment variable:**
   ```
   DATABASE_PATH=/data/attendance.db
   ```

### 4. Redeploy

1. **Railway dashboard** → **Deployments**
2. **Click "Redeploy"**
3. **Wait 2-3 minutes**
4. **Check logs** for any errors

## Check Railway Logs

If still crashing:

1. **Railway** → **Deployments** → Latest deployment
2. **View Logs**
3. **Scroll to bottom** - look for actual error
4. **Common errors:**
   - Database locked → Use volume
   - Port already in use → Already fixed with custom server
   - Missing module → Check build logs
   - Permission denied → Use /tmp or volume

## What Changed

**Before:**
- `npm start` → `next start` (didn't handle Railway's PORT)
- Database in `data/` directory (might not be writable)

**After:**
- `npm start` → `node server.js` (handles PORT correctly)
- Database path configurable via `DATABASE_PATH` env var
- Can use Railway volume for persistence

## If Still Not Working

Check Railway logs and share the actual error message - that will tell us exactly what's wrong!

