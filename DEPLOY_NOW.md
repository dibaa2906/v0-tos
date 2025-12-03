# 🚀 Deploy Your App Now - 5 Minutes

## Why Railway?

✅ **Easiest deployment** - Just connect GitHub  
✅ **Automatic HTTPS** - Camera will work immediately  
✅ **SQLite support** - No database changes needed  
✅ **Free tier** - $5 credit/month  
✅ **Auto-deploy** - Updates on every git push  

## Quick Steps

### 1. Push to GitHub (if not already)

```bash
git add .
git commit -m "Ready for production"
git push origin main
```

### 2. Deploy to Railway

1. Visit: **https://railway.app/new**
2. Click **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will automatically build and deploy!

### 3. Add Environment Variables

In Railway dashboard → Your project → Variables:

```
NODE_ENV=production
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-gmail-app-password
```

### 4. Get Your URL

Railway dashboard → Your service → Settings → **Copy your HTTPS URL**

### 5. Test!

Open your Railway URL and test the camera - it should work! 🎉

## That's It!

Your app is now live with HTTPS. The camera will work because Railway provides SSL certificates automatically.

## Need Help?

- Railway docs: https://docs.railway.app
- Check logs: Railway dashboard → Deployments → View Logs
- Support: support@railway.app

---

**Alternative:** If you prefer Vercel (also easy but requires database migration):
- Visit: https://vercel.com
- Import your GitHub repo
- Note: You'll need to migrate from SQLite to Vercel Postgres/Supabase

