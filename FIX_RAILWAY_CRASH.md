# Fix Railway Deployment Crash

## The Problem
Railway shows: "ELIFECYCLE Command failed" and container stops.

## Most Likely Causes

### 1. SQLite Database Issues
Railway's filesystem is ephemeral - database files might not persist or might cause issues.

### 2. Missing Environment Variables
Required variables not set in Railway.

### 3. Port Configuration
Next.js might be binding to wrong port.

## Solutions

### Solution 1: Check Railway Logs (First Step)

1. **Railway dashboard** → Your service
2. **Deployments** → Latest deployment
3. **View Logs**
4. **Scroll to bottom** - look for actual error message
5. **Common errors:**
   - Database locked
   - Port already in use
   - Missing environment variable
   - Module not found

### Solution 2: Add Port Configuration

Railway uses dynamic ports. Update `package.json`:

```json
"scripts": {
  "start": "next start -p $PORT"
}
```

Or create `server.js` for Railway:

```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
```

### Solution 3: Fix Database Path for Railway

Railway needs writable directory. Update `lib/db.ts`:

```typescript
// Use Railway's data directory or /tmp
const dbPath = process.env.DATABASE_PATH || 
  path.join(process.cwd(), 'data', 'attendance.db')
```

### Solution 4: Add Required Environment Variables

In Railway dashboard → Variables, add:

```
NODE_ENV=production
PORT=3000
DATABASE_PATH=/tmp/attendance.db
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
```

### Solution 5: Use Railway Volume for Database

1. **Railway dashboard** → Your service
2. **Settings** → **"Volumes"**
3. **Create Volume** for `/data` directory
4. **Set environment variable:** `DATABASE_PATH=/data/attendance.db`

## Quick Fix Steps

1. **Check Railway logs** for actual error
2. **Add PORT environment variable** in Railway
3. **Create volume** for database persistence
4. **Redeploy**

## Alternative: Use Railway Postgres (Recommended)

SQLite might not work well on Railway. Consider migrating to Railway Postgres:

1. **Railway dashboard** → **New** → **Database** → **PostgreSQL**
2. **Connect to your service**
3. **Update code** to use PostgreSQL instead of SQLite

But this requires code changes.

## Most Likely Fix

**Check Railway logs first** - the actual error will tell us what's wrong!

