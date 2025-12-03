# ✅ Railway Deployment Checklist

## Your Local Code is CORRECT ✅
Your code shows "Langkawi Port Sdn Bhd" - that's correct!

## Railway is Deploying Wrong Website ❌

### Step-by-Step Fix:

#### 1. Check Railway Source (MOST IMPORTANT)
1. Go to: **https://railway.app**
2. Click on your project: **`v0-tos-production`**
3. Click **"Settings"** tab
4. Scroll to **"Source"** section
5. **VERIFY:**
   - Repository: Should be `mnasarudin/v0-tos`
   - Branch: Should be `main` (or `master`)
6. **If WRONG:**
   - Click **"Change Source"**
   - Select correct repository: `mnasarudin/v0-tos`
   - Select correct branch: `main`
   - Save

#### 2. Force Fresh Deployment
1. Go to **"Deployments"** tab
2. Click **"Redeploy"** button (or three dots → Redeploy)
3. **Wait 2-3 minutes** for deployment
4. Check deployment logs to see which repo it's cloning

#### 3. Check Deployment Logs
1. Click on latest deployment
2. Click **"View Logs"**
3. Look for line: `"Cloning repository..."`
4. **Should say:** `mnasarudin/v0-tos`
5. **Should NOT say:** Any other repository name

#### 4. If Still Wrong - Delete and Recreate
1. **Delete current service** in Railway
2. **Create new project:** https://railway.app/new
3. **Deploy from GitHub repo**
4. **Select:** `mnasarudin/v0-tos`
5. **Select branch:** `main`
6. **Add environment variables:**
   - `NODE_ENV=production`
   - `GMAIL_USER=your-email@gmail.com`
   - `GMAIL_PASS=your-app-password`
7. **Deploy**

## What You Should See (When Fixed)

✅ Header: **"Langkawi Port Sdn Bhd"**  
✅ Title: **"Intern Attendance Management System"**  
✅ Features: Clock In/Out, Leave Applications, Daily Logs  
✅ Footer: Langkawi Port contact info  

## What You're Seeing Now (WRONG)

❌ Header: **"Enterprise"**  
❌ Title: **"The complete platform to build the web"**  
❌ Content: **"Enterprise Platform"**  

## Most Likely Issue

Railway is deploying a **different repository** or **wrong branch**. Check the Source settings!

