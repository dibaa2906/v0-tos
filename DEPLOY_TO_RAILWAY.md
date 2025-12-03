# Deploy to Railway - Easiest Production Setup

Railway is the **easiest** way to deploy your app with:
- ✅ Automatic HTTPS (camera will work!)
- ✅ SQLite support (no database migration needed)
- ✅ Free tier available
- ✅ Automatic deployments from GitHub
- ✅ Zero server management

## Step 1: Prepare Your Code (2 minutes)

1. **Make sure everything is committed:**
   ```bash
   git add .
   git commit -m "Ready for Railway deployment"
   ```

2. **Push to GitHub:**
   ```bash
   git push origin main
   ```

## Step 2: Deploy to Railway (5 minutes)

1. **Go to:** https://railway.app
2. **Click "Start a New Project"**
3. **Choose "Deploy from GitHub repo"**
4. **Select your repository**
5. **Railway will automatically:**
   - Detect it's a Next.js app
   - Install dependencies
   - Build the app
   - Deploy it

## Step 3: Add Environment Variables

1. **Click on your project** in Railway dashboard
2. **Go to "Variables" tab**
3. **Add these variables:**
   ```
   NODE_ENV=production
   GMAIL_USER=your-email@gmail.com
   GMAIL_PASS=your-gmail-app-password
   PORT=3000
   ```

## Step 4: Get Your HTTPS URL

1. **Click on your service** in Railway
2. **Go to "Settings" tab**
3. **Click "Generate Domain"** (or use your custom domain)
4. **Copy your HTTPS URL** (e.g., `https://your-app.up.railway.app`)

## Step 5: Test Camera Access

1. **Open your Railway URL** (should be HTTPS)
2. **Go to signup page**
3. **Camera should work!** ✅

## That's It!

Your app is now:
- ✅ Live on HTTPS (camera works!)
- ✅ Auto-deploys on every git push
- ✅ Automatically restarts if it crashes
- ✅ Free tier: $5 credit/month

## Custom Domain (Optional)

1. **In Railway dashboard**, go to your service
2. **Settings** → **Networking**
3. **Add your custom domain**
4. **Railway automatically provides SSL certificate**

## Monitoring

- **View logs:** Click on your service → "Deployments" → Click on a deployment → "View Logs"
- **Metrics:** Railway dashboard shows CPU, memory, and network usage

## Troubleshooting

**Camera still not working?**
- Verify URL starts with `https://`
- Check browser console for errors
- Ensure camera permissions are granted

**Build fails?**
- Check Railway logs for errors
- Make sure all dependencies are in `package.json`
- Verify `npm run build` works locally

**Database issues?**
- Railway provides persistent storage
- Database file is stored in Railway's filesystem
- No additional setup needed!

## Next Steps

1. Set up your custom domain (optional)
2. Configure email sending (Gmail credentials)
3. Test all features
4. Share your app URL with users!

Your app is now production-ready! 🚀

