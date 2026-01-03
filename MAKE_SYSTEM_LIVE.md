# Make Your System Live - Complete Guide 🌐

Step-by-step guide to make your application accessible on the internet.

---

## Current Status ✅

Based on what we've done:
- ✅ App is running on VM with PM2
- ✅ Code is pushed to GitHub (dev02 branch)
- ✅ Cloudflared is installed with service token
- ⚠️ Website not accessible yet (DNS issue)

---

## Step 1: Ensure App is Running on VM

**📍 VM Terminal:**

```bash
# Check PM2 status
pm2 status

# Should show: intern-attendance-system | online

# Test app locally
curl http://localhost:3000

# Should return HTML content

# View logs
pm2 logs intern-attendance-system --lines 10
```

**If app is not running:**
```bash
cd /var/www/intern-attendance
pm2 start ecosystem.config.js
pm2 save
```

---

## Step 2: Verify Cloudflared Service

**📍 VM Terminal:**

```bash
# Check cloudflared status
sudo systemctl status cloudflared

# Should show: active (running)

# Check logs
sudo journalctl -u cloudflared -n 20

# Should show: "Connection established" or "Registered tunnel connection"

# If not running:
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

---

## Step 3: Get Your Tunnel Information

**📍 VM Terminal:**

```bash
# Method 1: Get UUID from config
sudo cat /etc/cloudflared/config.yml | grep "^tunnel:" | awk '{print $2}'

# Method 2: Check logs for tunnel info
sudo journalctl -u cloudflared | grep -i "tunnel\|uuid" | head -5

# Method 3: Check Cloudflare Dashboard
# Go to: https://one.dash.cloudflare.com/ → Networks → Tunnels
```

**Save the Tunnel UUID** - you'll need it!

---

## Step 4: Configure DNS in Cloudflare Dashboard

Since your supervisor said you don't need to manually add DNS, they might handle it. But let's verify:

**📍 Mac Browser:**

1. **Go to:** https://dash.cloudflare.com
2. **Select:** `langkawiport.com.my`
3. **Go to:** **DNS** → **Records**
4. **Check if** `sanbox02` record exists:
   - Type: CNAME
   - Target: `<UUID>.cfargotunnel.com`
   - Proxy: **ON** (orange cloud ☁️)

**If record doesn't exist:**
- Ask your supervisor to create it
- Or create it yourself (see below)

---

## Step 5: Add DNS Record (If Needed)

**📍 Mac Browser (Cloudflare Dashboard):**

1. **DNS** → **Records** → **Add record**

Fill in:
- **Type:** `CNAME`
- **Name:** `sanbox02`
- **Target:** `<YOUR_UUID>.cfargotunnel.com`
- **Proxy:** **ON** (orange cloud ☁️)
- **TTL:** Auto

2. **Save**

---

## Step 6: Configure Tunnel Hostname

**📍 Mac Browser:**

1. **Go to:** https://one.dash.cloudflare.com/
2. **Networks** → **Tunnels**
3. **Click** your tunnel
4. **Public Hostnames** tab
5. **Check if** `sanbox02.langkawiport.com.my` exists

**If not, add it:**
- **Subdomain:** `sanbox02`
- **Domain:** `langkawiport.com.my`
- **Service:** `http://localhost:3000`
- **Save**

---

## Step 7: Configure SSL/TLS

**📍 Mac Browser (Cloudflare Dashboard):**

1. **SSL/TLS** → **Overview**
2. **Set:** **SSL/TLS encryption mode** to `Full` or `Full (strict)`
3. **NOT** "Flexible"

---

## Step 8: Wait and Test

**Wait 2-5 minutes** for DNS propagation, then:

**📍 Mac Terminal:**

```bash
# Test DNS
dig sanbox02.langkawiport.com.my

# Should show CNAME or Cloudflare IPs

# Test HTTPS
curl -v https://sanbox02.langkawiport.com.my

# Should return HTTP 200
```

**📍 Mac Browser:**

- Open: **https://sanbox02.langkawiport.com.my**
- Should load your website! 🎉

---

## Step 9: Verify Everything Works

**Checklist:**

- [ ] ✅ App running on VM (`pm2 status` shows online)
- [ ] ✅ App responds locally (`curl http://localhost:3000` works)
- [ ] ✅ Cloudflared service running (`sudo systemctl status cloudflared`)
- [ ] ✅ Tunnel connected (logs show "connection established")
- [ ] ✅ DNS record exists (Cloudflare Dashboard)
- [ ] ✅ DNS record is proxied (orange cloud ☁️)
- [ ] ✅ Tunnel hostname configured (Cloudflare Dashboard)
- [ ] ✅ SSL/TLS set to "Full"
- [ ] ✅ DNS resolves (`dig sanbox02.langkawiport.com.my`)
- [ ] ✅ Website accessible (https://sanbox02.langkawiport.com.my)

---

## Troubleshooting

### DNS Still Not Resolving?

1. **Wait longer** - DNS can take 5-10 minutes
2. **Check DNS record** - Ensure it exists and proxy is ON
3. **Flush DNS cache:**
   ```bash
   sudo dscacheutil -flushcache
   sudo killall -HUP mDNSResponder
   ```

### Website Shows Error?

1. **Check app logs:**
   ```bash
   pm2 logs intern-attendance-system --lines 50
   ```

2. **Check tunnel logs:**
   ```bash
   sudo journalctl -u cloudflared -n 30
   ```

3. **Verify app is running:**
   ```bash
   curl http://localhost:3000
   ```

### Connection Refused?

1. **App not running:**
   ```bash
   pm2 status
   pm2 restart intern-attendance-system
   ```

2. **Tunnel not connected:**
   ```bash
   sudo systemctl restart cloudflared
   sudo journalctl -u cloudflared -f
   ```

---

## Update Workflow (After Going Live)

**When you make changes:**

**📍 Mac Terminal:**
```bash
cd /Users/wanadiba/v0-tos
git add .
git commit -m "Your changes"
git push origin dev02
```

**📍 VM Terminal:**
```bash
cd /var/www/intern-attendance
git pull origin dev02
npm install
npm run build
pm2 restart intern-attendance-system
```

---

## Maintenance Commands

**Check status:**
```bash
# App
pm2 status
pm2 logs intern-attendance-system

# Cloudflared
sudo systemctl status cloudflared
sudo journalctl -u cloudflared -n 20
```

**Restart services:**
```bash
pm2 restart intern-attendance-system
sudo systemctl restart cloudflared
```

---

## Quick Verification

**Run these to check everything:**

**📍 VM Terminal:**
```bash
pm2 status && curl -I http://localhost:3000 && sudo systemctl status cloudflared --no-pager | head -5
```

**📍 Mac Terminal:**
```bash
dig sanbox02.langkawiport.com.my +short && curl -I https://sanbox02.langkawiport.com.my
```

---

## Summary

Your system will be live when:
1. ✅ App running on VM
2. ✅ Cloudflared connected
3. ✅ DNS record configured (or supervisor handles it)
4. ✅ Tunnel hostname configured
5. ✅ SSL/TLS set to "Full"

**Expected URL:** https://sanbox02.langkawiport.com.my

---

**Follow the steps above and your system will be live! 🚀**

