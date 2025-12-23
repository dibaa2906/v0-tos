# Start Development Server

## Quick Start

```bash
cd /Users/wanadiba/v0-tos
npm run dev
```

Wait for: `✓ Ready in Xms` and `○ Local: http://localhost:3000`

## If Port 3000 is Busy

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or kill all Next.js processes
pkill -f "next dev"

# Then start again
npm run dev
```

## If Server Won't Start

```bash
# Clear cache and restart
rm -rf .next
npm run dev
```

## Check if Server is Running

```bash
# Check port
lsof -ti:3000

# Check process
ps aux | grep "next dev"

# Test server
curl http://localhost:3000
```

## Common Issues

1. **Port already in use**: Kill the process using port 3000
2. **Build cache corrupted**: Delete `.next` folder
3. **Dependencies missing**: Run `npm install`
4. **Database locked**: Close any DB Browser or other tools accessing the database

## Access Your App

Once server is running:
- **URL**: http://localhost:3000
- **Status**: Should show your homepage
- **If blank**: Check browser console (F12) for errors






