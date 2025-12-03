# Quick Production Deployment Guide

## The Problem

**Camera access requires HTTPS** (except localhost). Your app needs to be accessible via `https://your-domain.com` for the camera to work.

## Quick Solution: Deploy to Vercel (5 minutes)

### Step 1: Prepare Your Code

1. **Make sure your code is committed:**
   ```bash
   git add .
   git commit -m "Ready for production"
   ```

2. **Push to GitHub:**
   ```bash
   git push origin main
   ```

### Step 2: Deploy to Vercel

1. **Go to:** https://vercel.com
2. **Sign up/Login** with GitHub
3. **Click "New Project"**
4. **Import your repository**
5. **Configure:**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

6. **Add Environment Variables:**
   - `GMAIL_USER` = your-email@gmail.com
   - `GMAIL_PASS` = your-gmail-app-password
   - `NODE_ENV` = production

7. **Click "Deploy"**

8. **Your app will be live at:** `https://your-app.vercel.app`

### Step 3: Test Camera

1. Open your Vercel URL (should be HTTPS)
2. Go to signup page
3. Camera should work! ✅

## Alternative: Self-Hosted with Your Own Domain

If you want to use your own domain:

### Step 1: Get a Domain

Buy a domain from:
- Namecheap
- Google Domains
- GoDaddy

### Step 2: Set Up Server

1. **Get a VPS** (Virtual Private Server):
   - DigitalOcean ($5/month)
   - Linode ($5/month)
   - AWS EC2 (free tier available)

2. **Install on server:**
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt-get install nginx
   ```

### Step 3: Deploy Your App

1. **Clone your repo:**
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   npm install
   npm run build
   ```

2. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### Step 4: Set Up HTTPS

1. **Install Certbot:**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. **Get SSL Certificate:**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Your app is now live at:** `https://your-domain.com`

## Important Notes

⚠️ **Vercel Limitation:** Vercel uses serverless functions, so SQLite won't work. You'll need to:
- Use Vercel Postgres, or
- Use Supabase, or
- Use PlanetScale

⚠️ **Self-Hosted:** Keep using SQLite, but set up regular backups!

## Testing Checklist

After deployment:

- [ ] App loads at HTTPS URL
- [ ] Camera permission prompt appears
- [ ] Can capture photo during signup
- [ ] Face recognition works during clock in/out
- [ ] All pages load correctly
- [ ] Email sending works
- [ ] Database operations work

## Need Help?

1. Check browser console for errors
2. Verify HTTPS is working (green lock icon)
3. Check camera permissions in browser settings
4. Test in different browsers (Chrome, Firefox, Safari)

