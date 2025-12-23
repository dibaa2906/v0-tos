# Deploy to Netlify - Step by Step

## Step 1: Prepare Your Code

Make sure your code is pushed to GitHub:
- Your fork: `https://github.com/dibaa2906/v0-tos`
- Branch: `main`

## Step 2: Deploy to Netlify (5 minutes)

### Option A: Deploy from GitHub (Recommended)

1. **Go to:** https://app.netlify.com
2. **Sign up/Login** (you can use GitHub to sign in)
3. **Click "Add new site"** → **"Import an existing project"**
4. **Choose "GitHub"**
5. **Authorize Netlify** to access your repositories
6. **Select repository:** `dibaa2906/v0-tos`
7. **Configure build:**
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Base directory:** (leave empty)
8. **Click "Deploy site"**

### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

## Step 3: Add Environment Variables

1. **Netlify dashboard** → Your site → **"Site settings"**
2. **"Environment variables"** → **"Add variable"**
3. **Add these variables:**
   ```
   NODE_ENV = production
   GMAIL_USER = your-email@gmail.com
   GMAIL_PASS = your-gmail-app-password
   DATABASE_PATH = /tmp/attendance.db
   ```

## Step 4: Configure Next.js for Netlify

Netlify uses serverless functions. You may need to:

1. **Install Netlify Next.js plugin:**
   ```bash
   npm install @netlify/plugin-nextjs
   ```

2. **The `netlify.toml` file is already created** - it's configured correctly!

## Step 5: Redeploy

1. **Netlify dashboard** → Your site
2. **"Deploys"** tab
3. **"Trigger deploy"** → **"Deploy site"**

## Step 6: Get Your HTTPS URL

1. **Netlify dashboard** → Your site
2. **Copy your site URL** (looks like: `https://your-site-name.netlify.app`)
3. **Test camera** - should work with HTTPS! ✅

## Important Notes

⚠️ **SQLite on Netlify:**
- Netlify uses serverless functions (ephemeral filesystem)
- SQLite database won't persist between function calls
- **Recommendation:** Use Netlify's built-in database or external database service

### Option: Use Netlify Functions with External Database

Consider migrating to:
- **Supabase** (free PostgreSQL)
- **PlanetScale** (free MySQL)
- **Railway Postgres** (if you have Railway account)

## Custom Domain (Optional)

1. **Netlify dashboard** → Your site → **"Domain settings"**
2. **"Add custom domain"**
3. **Enter your domain**
4. **Netlify automatically provides SSL** (HTTPS)

## That's It!

Your app is now live on Netlify with HTTPS! 🚀






