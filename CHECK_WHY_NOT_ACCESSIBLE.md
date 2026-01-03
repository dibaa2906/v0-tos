# Check Why Website Not Accessible (Even Though It's "Live") 🔍

Your supervisor says it's already live, but you can't access it. Let's find out why.

---

## Possible Reasons

1. ✅ Domain/DNS already configured (supervisor did it)
2. ❌ App not running on VM
3. ❌ Code not updated on VM
4. ❌ Cloudflared service not running
5. ❌ Wrong URL being used

---

## What to Check Tomorrow (At Server)

### Step 1: Check App Status

**📍 VM Terminal:**

```bash
# Check if app is running
pm2 status

# Should show: intern-attendance-system | online

# If not running or error:
pm2 logs intern-attendance-system --lines 50

# Test app locally
curl http://localhost:3000

# Should return HTML, not error
```

**If app is not running:**
```bash
cd /var/www/intern-attendance
pm2 start ecosystem.config.js
pm2 save
```

---

### Step 2: Check Code is Updated

**📍 VM Terminal:**

```bash
cd /var/www/intern-attendance

# Check current branch
git branch

# Should be on dev02 or correct branch

# Check if code is up to date
git status
git log --oneline -5

# Pull latest if needed
git pull origin dev02
```

---

### Step 3: Verify Cloudflared Service

**📍 VM Terminal:**

```bash
# Check cloudflared status
sudo systemctl status cloudflared

# Should show: active (running)

# Check logs
sudo journalctl -u cloudflared -n 30

# Should show: "Connection established" or "Registered tunnel connection"

# If not running:
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

---

### Step 4: Find the Actual URL

**Your supervisor said it's live, so ask:**

1. **What's the exact URL?**
   - Is it `sanbox02.langkawiport.com.my`?
   - Or a different subdomain?
   - Or a different domain entirely?

2. **What should you test?**
   - Ask for the exact URL to access

---

### Step 5: Test from VM

**📍 VM Terminal:**

```bash
# Test the URL your supervisor gave you
curl -v https://SANDBOX02.LANGKAWIPORT.COM.MY

# Replace with actual URL from supervisor
# Should return HTTP 200

# Check DNS resolution
dig SANDBOX02.LANGKAWIPORT.COM.MY

# Should show Cloudflare IPs or CNAME
```

---

## Quick Diagnostic Commands

**Run these on VM tomorrow:**

```bash
# 1. App status
pm2 status && curl -I http://localhost:3000

# 2. Code status
cd /var/www/intern-attendance && git status && git log --oneline -3

# 3. Cloudflared status
sudo systemctl status cloudflared --no-pager | head -10

# 4. Recent logs
sudo journalctl -u cloudflared -n 20 --no-pager

# 5. Check config
sudo cat /etc/cloudflared/config.yml | head -10
```

---

## Common Issues

### Issue 1: App Not Running

**Symptom:** Website shows error or doesn't load

**Fix:**
```bash
pm2 restart intern-attendance-system
pm2 logs intern-attendance-system
```

---

### Issue 2: Code Not Updated

**Symptom:** Old version showing, changes not visible

**Fix:**
```bash
cd /var/www/intern-attendance
git pull origin dev02
npm install
npm run build
pm2 restart intern-attendance-system
```

---

### Issue 3: Cloudflared Not Connected

**Symptom:** Website can't connect

**Fix:**
```bash
sudo systemctl restart cloudflared
sudo journalctl -u cloudflared -f
```

---

### Issue 4: Wrong URL

**Symptom:** Using wrong URL

**Fix:**
- Ask supervisor for the exact URL
- Check Cloudflare Dashboard → DNS → Records
- Check Tunnel → Public Hostnames

---

## Questions to Ask Your Supervisor

1. **What's the exact URL to access the website?**
2. **Is the app running on the VM?**
3. **Is Cloudflared service running?**
4. **What branch should be deployed?**
5. **What's the current status?** (working/not working)

---

## What You Can Do Now (From Home)

### Check if URL Works

**📍 Mac Browser:**

Try accessing:
- https://sanbox02.langkawiport.com.my
- https://intern.langkawiport.com.my
- Or whatever URL your supervisor mentioned

**What error do you see?**
- "Cannot find server" → DNS issue
- "Connection refused" → App/tunnel not running
- "502 Bad Gateway" → App error
- Blank page → App issue

---

### Test DNS Resolution

**📍 Mac Terminal:**

```bash
# Test DNS
dig sanbox02.langkawiport.com.my

# If empty → DNS not configured (but supervisor said it is?)
# If shows IP → DNS working, problem is elsewhere
```

---

## Tomorrow's Action Plan

**When you have server access:**

1. ✅ Check app is running: `pm2 status`
2. ✅ Check app responds: `curl http://localhost:3000`
3. ✅ Check Cloudflared: `sudo systemctl status cloudflared`
4. ✅ Pull latest code: `git pull origin dev02`
5. ✅ Rebuild if needed: `npm run build`
6. ✅ Restart app: `pm2 restart intern-attendance-system`
7. ✅ Test URL supervisor gave you

---

## Summary

**Since supervisor says it's already live:**

1. **Ask supervisor:**
   - What's the exact URL?
   - What's the current status?

2. **Check on VM tomorrow:**
   - Is app running?
   - Is Cloudflared running?
   - Is code up to date?

3. **Likely issue:**
   - App not running on VM
   - Code not updated
   - Cloudflared service stopped

**Most common:** App just needs to be restarted or code needs to be pulled/updated!

---

## Quick Fix (Tomorrow)

**Most likely this will fix it:**

```bash
# On VM
cd /var/www/intern-attendance
git pull origin dev02
npm install
npm run build
pm2 restart intern-attendance-system

# Verify
pm2 status
curl http://localhost:3000
sudo systemctl status cloudflared
```

**Then test the URL your supervisor gave you!**

