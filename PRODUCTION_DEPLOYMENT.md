# Production Deployment Guide

## Why HTTPS is Required for Camera Access

Modern browsers (Chrome, Firefox, Safari) **require HTTPS** for camera access, except when using `localhost`. This is a security feature to protect user privacy.

**The camera will NOT work on:**
- ❌ `http://your-domain.com` (HTTP without SSL)
- ❌ `http://192.168.1.100:3000` (Local IP without HTTPS)

**The camera WILL work on:**
- ✅ `https://your-domain.com` (HTTPS with SSL certificate)
- ✅ `http://localhost:3000` (Development only)

## Deployment Options

### Option 1: Deploy to Vercel (Recommended - Easiest)

Vercel provides free HTTPS and is perfect for Next.js apps.

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set Environment Variables in Vercel Dashboard:**
   - `GMAIL_USER` - Your Gmail address
   - `GMAIL_PASS` - Your Gmail app password
   - `NODE_ENV=production`

5. **Your app will be live at:** `https://your-app.vercel.app`

**Note:** Vercel uses serverless functions, so you'll need to use a different database solution (like Vercel Postgres, Supabase, or PlanetScale) instead of SQLite.

### Option 2: Self-Hosted with Nginx + Let's Encrypt (Full Control)

This allows you to keep using SQLite and have full control.

#### Step 1: Set up Nginx Reverse Proxy

1. **Install Nginx:**
   ```bash
   # macOS
   brew install nginx
   
   # Ubuntu/Debian
   sudo apt-get install nginx
   ```

2. **Create Nginx config** (`/etc/nginx/sites-available/intern-attendance`):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Enable the site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/intern-attendance /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

#### Step 2: Install SSL Certificate with Let's Encrypt

1. **Install Certbot:**
   ```bash
   # macOS
   brew install certbot
   
   # Ubuntu/Debian
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. **Get SSL Certificate:**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Auto-renewal (certificates expire every 90 days):**
   ```bash
   sudo certbot renew --dry-run
   ```

#### Step 3: Update PM2 Configuration

Update `ecosystem.config.js`:
```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3000,
  HOST: '0.0.0.0' // Listen on all interfaces
}
```

#### Step 4: Build and Start

```bash
npm run build
pm2 restart intern-attendance-system
```

### Option 3: Deploy to Railway/Render/Fly.io

These platforms provide HTTPS automatically:

1. **Railway:**
   - Connect your GitHub repo
   - Set environment variables
   - Deploy automatically

2. **Render:**
   - Create a new Web Service
   - Connect your repo
   - Set build command: `npm run build`
   - Set start command: `npm start`

3. **Fly.io:**
   - Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
   - Run: `fly launch`
   - Deploy: `fly deploy`

## Environment Variables for Production

Create a `.env.production` file:

```env
NODE_ENV=production
PORT=3000
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
```

## Production Checklist

- [ ] Build the app: `npm run build`
- [ ] Set up HTTPS (required for camera)
- [ ] Configure environment variables
- [ ] Set up PM2 for auto-restart
- [ ] Configure domain DNS to point to your server
- [ ] Test camera access on production URL
- [ ] Test face recognition
- [ ] Set up database backups
- [ ] Configure email sending
- [ ] Test all features on production

## Testing Camera Access

After deployment, test camera access:

1. Open your production URL (must be HTTPS)
2. Go to signup page
3. Try to capture a photo
4. Check browser console for errors

If camera doesn't work:
- Verify URL starts with `https://`
- Check browser console for permission errors
- Ensure camera permissions are granted
- Try a different browser

## Troubleshooting

### Camera Still Not Working

1. **Check HTTPS:**
   ```bash
   curl -I https://your-domain.com
   # Should return 200 OK
   ```

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for camera permission errors
   - Check for HTTPS warnings

3. **Test Camera API:**
   ```javascript
   navigator.mediaDevices.getUserMedia({ video: true })
     .then(stream => console.log('Camera works!'))
     .catch(err => console.error('Camera error:', err))
   ```

### Database Issues

If using SQLite in production:
- Ensure database file has write permissions
- Set up regular backups
- Consider migrating to PostgreSQL for better production support

## Security Considerations

1. **Use strong passwords** for admin accounts
2. **Enable rate limiting** on API routes
3. **Set up firewall** rules
4. **Regular backups** of database
5. **Monitor logs** for suspicious activity
6. **Keep dependencies updated**

## Next Steps

1. Choose your deployment option
2. Set up domain and DNS
3. Configure HTTPS
4. Deploy and test
5. Monitor and maintain

