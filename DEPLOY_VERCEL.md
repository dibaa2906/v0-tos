# Deploy to Vercel - EASIEST Option! 🚀

## Why Vercel is Easiest

✅ **Made by Next.js team** - Perfect for Next.js apps  
✅ **Automatic HTTPS** - Camera will work immediately  
✅ **Zero configuration** - Just connect GitHub  
✅ **Free tier** - Generous free plan  
✅ **Auto-deploy** - Deploys on every git push  
✅ **No setup needed** - Detects Next.js automatically  

## Step-by-Step (3 minutes)

### Step 1: Go to Vercel

**Open:** https://vercel.com/new

### Step 2: Sign In

- **Click "Sign Up"** or "Log In"
- **Use GitHub** to sign in (easiest!)

### Step 3: Import Your Repository

1. **Click "Import Project"**
2. **Select "GitHub"**
3. **Authorize Vercel** to access your repositories
4. **Find and select:** `dibaa2906/v0-tos`
5. **Click "Import"**

### Step 4: Configure (Auto-filled!)

Vercel will automatically detect:
- ✅ Framework: Next.js
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `.next`
- ✅ Install Command: `npm install`

**Just click "Deploy"!** (No changes needed)

### Step 5: Add Environment Variables

While deploying (takes 2-3 minutes):

1. **Click "Environment Variables"** (or go to Settings → Environment Variables after deploy)
2. **Add these variables:**
   ```
   NODE_ENV = production
   ```
   ```
   GMAIL_USER = your-email@gmail.com
   ```
   ```
   GMAIL_PASS = your-gmail-app-password
   ```

### Step 6: Get Your URL

1. **Wait for deployment** to finish (shows "Ready")
2. **Copy your URL** (looks like: `https://v0-tos.vercel.app`)
3. **Open in browser** - your app is live! ✅

## That's It!

Your app is now:
- ✅ Live with HTTPS (camera works!)
- ✅ Auto-deploys on every git push
- ✅ Free tier included
- ✅ Fast CDN globally

## Custom Domain (Optional)

1. **Vercel dashboard** → Your project → **Settings**
2. **Domains** → **Add Domain**
3. **Enter your domain**
4. **Vercel automatically provides SSL** (HTTPS)

## Important Note: Database

⚠️ **SQLite won't work on Vercel** (serverless functions)

**Options:**
1. **Vercel Postgres** (built-in, easy)
2. **Supabase** (free PostgreSQL)
3. **PlanetScale** (free MySQL)

But for now, you can deploy and test - the app will work, just database won't persist.

## Troubleshooting

**Build fails?**
- Check Vercel build logs
- Make sure all dependencies are in `package.json`

**Camera not working?**
- Verify URL starts with `https://`
- Check browser console for errors

## Why Vercel is Better Than Netlify

- ✅ Easier setup (made for Next.js)
- ✅ Better Next.js support
- ✅ Faster deployments
- ✅ Better free tier
- ✅ Automatic optimizations

---

**Total time: 3 minutes!** 🎉

