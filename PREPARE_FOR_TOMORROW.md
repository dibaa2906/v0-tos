# What to Do Now (From Home) & Tomorrow (At Server) 📋

Since you're at home and can't access the server now, here's what you can prepare today and what to do tomorrow.

---

## TODAY - What You Can Do From Home 🏠

### 1. Verify Your Code is Ready

**📍 Mac Terminal:**

```bash
cd /Users/wanadiba/v0-tos

# Check git status
git status

# Make sure everything is committed
git add .
git commit -m "Final updates before deployment"

# Push to GitHub
git push origin dev02

# Verify it's pushed
git log --oneline -3
```

---

### 2. Prepare Deployment Checklist

**Checklist for tomorrow:**

- [ ] SSH access to VM works
- [ ] Pull latest code from GitHub
- [ ] Verify app is running on VM
- [ ] Verify Cloudflared service status
- [ ] Get Tunnel UUID
- [ ] Configure DNS in Cloudflare Dashboard
- [ ] Configure Tunnel hostname
- [ ] Test website

---

### 3. Prepare Cloudflare Dashboard Access

**📍 Mac Browser:**

1. **Login to Cloudflare Dashboard:**
   - Go to: https://dash.cloudflare.com
   - Make sure you can login
   - Verify you can see `langkawiport.com.my` domain

2. **Check Cloudflare Zero Trust/Tunnels:**
   - Go to: https://one.dash.cloudflare.com/
   - Check if you have access to Networks → Tunnels
   - Note the tunnel name (if you can see it)

3. **Prepare DNS Record Info:**
   - You'll need to create:
     - Type: CNAME
     - Name: `sanbox02`
     - Target: `<TUNNEL_UUID>.cfargotunnel.com`
     - Proxy: ON (orange cloud)

---

### 4. Document What You Need Tomorrow

**Create a note with:**
- VM IP address
- SSH username
- Repository URL: `https://github.com/dibaa2906/v0-tos.git`
- Branch: `dev02`
- Domain: `sanbox02.langkawiport.com.my`
- Cloudflare login credentials

---

### 5. Test Your Code Locally (Optional)

**📍 Mac Terminal:**

```bash
cd /Users/wanadiba/v0-tos

# Install dependencies (if needed)
npm install

# Test build
npm run build

# Test locally
npm run dev

# Open: http://localhost:3000
# Test that everything works
```

---

## TOMORROW - What to Do at Server 🖥️

### Step 1: Connect to VM

**📍 VM Terminal (SSH):**

```bash
ssh user@your-vm-ip

# Replace with your actual VM details
```

---

### Step 2: Pull Latest Code

**📍 VM Terminal:**

```bash
cd /var/www/intern-attendance

# Pull latest from dev02 branch
git fetch origin
git checkout dev02
git pull origin dev02

# Verify
git log --oneline -3
```

---

### Step 3: Rebuild Application

**📍 VM Terminal:**

```bash
cd /var/www/intern-attendance

# Install any new dependencies
npm install

# Build
npm run build

# Restart app
pm2 restart intern-attendance-system

# Check status
pm2 status
pm2 logs intern-attendance-system --lines 10
```

---

### Step 4: Verify App is Running

**📍 VM Terminal:**

```bash
# Test locally
curl http://localhost:3000

# Should return HTML content
```

---

### Step 5: Check Cloudflared Status

**📍 VM Terminal:**

```bash
# Check service
sudo systemctl status cloudflared

# Check logs
sudo journalctl -u cloudflared -n 20

# Should show: "Connection established"

# If not running:
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

---

### Step 6: Get Tunnel UUID

**📍 VM Terminal:**

```bash
# Get UUID from config
sudo cat /etc/cloudflared/config.yml | grep "^tunnel:" | awk '{print $2}'

# OR check logs
sudo journalctl -u cloudflared | grep -i "tunnel\|uuid" | head -5

# Save this UUID - you'll need it!
```

---

### Step 7: Configure DNS in Cloudflare

**📍 Mac Browser (or any computer):**

1. **Go to:** https://dash.cloudflare.com
2. **Select:** `langkawiport.com.my`
3. **DNS** → **Records** → **Add record**
4. Fill in:
   - Type: `CNAME`
   - Name: `sanbox02`
   - Target: `<YOUR_UUID>.cfargotunnel.com` (from Step 6)
   - Proxy: **ON** (orange cloud ☁️)
5. **Save**

---

### Step 8: Configure Tunnel Hostname

**📍 Browser:**

1. **Go to:** https://one.dash.cloudflare.com/
2. **Networks** → **Tunnels**
3. **Click** your tunnel
4. **Public Hostnames** tab
5. **Add hostname** (if not exists):
   - Subdomain: `sanbox02`
   - Domain: `langkawiport.com.my`
   - Service: `http://localhost:3000`
6. **Save**

---

### Step 9: Configure SSL/TLS

**📍 Browser:**

1. **SSL/TLS** → **Overview**
2. Set to: `Full` or `Full (strict)`

---

### Step 10: Wait and Test

**Wait 2-5 minutes, then:**

**📍 Browser:**
- Open: **https://sanbox02.langkawiport.com.my**

**📍 Terminal:**
```bash
# Test DNS
dig sanbox02.langkawiport.com.my

# Test HTTPS
curl -v https://sanbox02.langkawiport.com.my
```

---

## Quick Reference Commands for Tomorrow

**On VM:**
```bash
# Pull code
cd /var/www/intern-attendance
git pull origin dev02

# Rebuild
npm install
npm run build

# Restart
pm2 restart intern-attendance-system

# Check status
pm2 status
curl http://localhost:3000

# Cloudflared
sudo systemctl status cloudflared
sudo cat /etc/cloudflared/config.yml | grep "^tunnel:"
```

---

## Today's To-Do List

**From your Mac at home:**

- [ ] ✅ Push all code to GitHub (dev02 branch)
- [ ] ✅ Verify Cloudflare Dashboard login works
- [ ] ✅ Test code locally (optional)
- [ ] ✅ Document VM access details
- [ ] ✅ Prepare deployment checklist

**Everything else can wait until tomorrow when you have server access!**

---

## Tomorrow's Quick Steps

1. SSH to VM
2. Pull latest code
3. Rebuild app
4. Verify Cloudflared running
5. Get Tunnel UUID
6. Configure DNS in Cloudflare Dashboard
7. Add Tunnel hostname
8. Test website

**Should take about 15-20 minutes!**

---

## Summary

**Today (from home):**
- ✅ Make sure code is pushed to GitHub
- ✅ Verify Cloudflare login works
- ✅ Prepare checklist

**Tomorrow (at server):**
- ✅ Pull code, rebuild, restart app
- ✅ Verify Cloudflared
- ✅ Configure DNS and Tunnel
- ✅ Test website

**You're all set! Just follow the steps tomorrow. 🚀**

