# Deploy Without Cloudflared - Alternative Options 🚀

Here are ways to make your system live without using Cloudflare Tunnel.

---

## Option 1: Deploy to Vercel (Recommended - Easiest) ⭐

Vercel is perfect for Next.js apps and provides free hosting with HTTPS.

### Steps:

**📍 Mac Terminal:**

```bash
cd /Users/wanadiba/v0-tos

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Deploy to production? Yes
```

**That's it!** You'll get a URL like: `https://your-app.vercel.app`

### Connect to GitHub (Automatic Deployments):

1. Go to: https://vercel.com
2. Import your GitHub repository: `dibaa2906/v0-tos`
3. Set branch to: `dev02`
4. Deploy automatically on every push!

---

## Option 2: Deploy to Netlify

Similar to Vercel, great for Next.js apps.

### Steps:

**📍 Mac Terminal:**

```bash
cd /Users/wanadiba/v0-tos

# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

**Or via website:**
1. Go to: https://netlify.com
2. Connect GitHub repository
3. Set branch: `dev02`
4. Build command: `npm run build`
5. Publish directory: `.next`
6. Deploy!

---

## Option 3: Use Nginx with Let's Encrypt (On VM)

If you have a domain and public IP, use Nginx with SSL certificate.

### Steps:

**📍 VM Terminal:**

```bash
# Install Nginx
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/intern-attendance
```

**Paste this:**
```nginx
server {
    listen 80;
    server_name sanbox02.langkawiport.com.my;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable and get SSL:**

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/intern-attendance /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d sanbox02.langkawiport.com.my

# Auto-renewal is set up automatically
```

**Requirements:**
- ✅ Domain pointing to your VM's public IP
- ✅ Port 80 and 443 open in firewall
- ✅ Public IP address

---

## Option 4: Use ngrok (Quick Tunnel)

Quick temporary solution for testing.

### Steps:

**📍 VM Terminal:**

```bash
# Install ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# Sign up at: https://ngrok.com (free account)
# Get authtoken from dashboard

# Configure
ngrok config add-authtoken YOUR_AUTH_TOKEN

# Start tunnel
ngrok http 3000
```

You'll get a URL like: `https://xxxxx.ngrok.io`

**Note:** Free tier URLs change each time you restart.

---

## Option 5: Use Cloudflare Pages (Static/Serverless)

If your app can work with serverless functions.

### Steps:

1. Go to: https://pages.cloudflare.com
2. Connect GitHub repository
3. Build settings:
   - Framework preset: Next.js
   - Build command: `npm run build`
   - Output directory: `.next`
4. Deploy!

---

## Option 6: Direct IP Access (Temporary Testing)

If you have public IP and port forwarding.

**📍 VM Terminal:**

```bash
# Allow port 3000 in firewall
sudo ufw allow 3000/tcp

# Access via: http://YOUR_VM_PUBLIC_IP:3000
```

**Note:** No HTTPS, not secure, only for testing.

---

## Comparison

| Option | HTTPS | Free | Domain | Difficulty | Best For |
|--------|-------|------|--------|------------|----------|
| **Vercel** | ✅ Yes | ✅ Yes | ✅ Custom | ⭐ Easy | Production |
| **Netlify** | ✅ Yes | ✅ Yes | ✅ Custom | ⭐ Easy | Production |
| **Nginx + SSL** | ✅ Yes | ✅ Yes | ⚠️ Required | ⭐⭐ Medium | Production |
| **ngrok** | ✅ Yes | ✅ Yes | ❌ No | ⭐ Easy | Testing |
| **Cloudflare Pages** | ✅ Yes | ✅ Yes | ✅ Custom | ⭐ Easy | Static/Serverless |
| **Direct IP** | ❌ No | ✅ Yes | ❌ No | ⭐ Easy | Testing only |

---

## Recommended: Use Vercel ⭐

**Easiest and best for Next.js:**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd /Users/wanadiba/v0-tos
vercel

# Follow prompts - done!
```

**Or connect GitHub:**
1. Push to GitHub (already done!)
2. Go to: https://vercel.com
3. Import repository
4. Auto-deploys on every push!

---

## Quick Vercel Setup

**📍 Mac Terminal:**

```bash
cd /Users/wanadiba/v0-tos

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# It will ask:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No (create new)
# - Project name? intern-attendance
# - Directory? ./
# - Override settings? No

# Done! Get your URL
```

**Then connect GitHub for auto-deploy:**
1. Go to: https://vercel.com/dashboard
2. Click your project
3. Settings → Git
4. Connect GitHub repository
5. Production branch: `dev02`
6. Auto-deploy enabled!

---

## Which Should You Use?

**For Production:**
- ✅ **Vercel** - Best for Next.js, easy setup
- ✅ **Netlify** - Good alternative
- ✅ **Nginx + SSL** - If you have domain and public IP

**For Testing:**
- ✅ **ngrok** - Quick temporary tunnel

---

## Next Steps

**Choose one:**
1. **Vercel** (recommended) - Easiest, free, automatic
2. **Netlify** - Similar to Vercel
3. **Nginx + SSL** - If you have domain and want to use VM
4. **ngrok** - Quick testing

Let me know which one you want to use and I'll guide you through it!

