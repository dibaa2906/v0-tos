# 🚀 Deploy to Railway RIGHT NOW

Your code is already on GitHub! Just follow these steps:

## Step 1: Go to Railway (1 minute)

1. **Open this link:** https://railway.app/new
2. **Click "Deploy from GitHub repo"**
3. **Sign in with GitHub** (if not already)
4. **Authorize Railway** to access your repositories

## Step 2: Select Your Repo (30 seconds)

1. **Find and select:** `mnasarudin/v0-tos`
2. **Click "Deploy Now"**
3. Railway will start building automatically

## Step 3: Add Environment Variables (1 minute)

While Railway is building:

1. **Click on your project** in Railway dashboard
2. **Go to "Variables" tab**
3. **Click "New Variable"** and add these one by one:

   ```
   NODE_ENV = production
   ```

   ```
   GMAIL_USER = your-email@gmail.com
   ```

   ```
   GMAIL_PASS = your-gmail-app-password
   ```

## Step 4: Get Your HTTPS URL (30 seconds)

1. **Wait for deployment to finish** (shows "Deployed" status)
2. **Click on your service**
3. **Go to "Settings" tab**
4. **Under "Networking"**, click **"Generate Domain"**
5. **Copy the HTTPS URL** (looks like: `https://your-app.up.railway.app`)

## Step 5: Test Camera! (30 seconds)

1. **Open your Railway URL** in browser
2. **Go to signup page**
3. **Try to use camera** - it should work! ✅

## Total Time: ~3-4 minutes

Your app will be live with HTTPS and camera will work!

---

## Troubleshooting

**Build failed?**
- Check Railway logs: Click on deployment → "View Logs"
- Make sure all files are committed to GitHub

**Can't find your repo?**
- Make sure you authorized Railway to access your GitHub
- Check that the repo is public or you've given Railway access

**Need help?**
- Railway docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

