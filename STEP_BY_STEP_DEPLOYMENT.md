# Step-by-Step Deployment Guide - Start Here! 🚀

## Overview
- **Your VM IP:** 192.168.1.113 or 192.168.1.114
- **VM Username:** user
- **VM Password:** user@123
- **VM OS:** Ubuntu Desktop 24.04 LTS

---

## STEP 1: Connect to Your VM

**WHERE:** On your local computer (Mac/Windows/Linux)

**WHAT TO DO:**

Open Terminal (Mac/Linux) or PowerShell/Command Prompt (Windows) and run:

```bash
ssh user@192.168.1.113
```

**OR if that IP doesn't work, try:**

```bash
ssh user@192.168.1.114
```

**When prompted:**
- Enter password: `user@123`
- Type `yes` if asked about host authenticity

**✅ Success:** You should see a prompt like: `user@your-vm-name:~$`

---

## STEP 2: Update Your VM System

**WHERE:** On the VM (you should be connected via SSH from Step 1)

**WHAT TO DO:**

```bash
sudo apt update
sudo apt upgrade -y
```

**Enter password when prompted:** `user@123`

**✅ Success:** System packages updated

---

## STEP 3: Install Node.js

**WHERE:** Still on the VM (same SSH session)

**WHAT TO DO:**

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

**Verify installation:**

```bash
node --version
npm --version
```

**✅ Success:** You should see Node.js version (v18.x or higher) and npm version

---

## STEP 4: Install Required Software

**WHERE:** Still on the VM

**WHAT TO DO:**

```bash
# Install Git, Nginx, and build tools
sudo apt install -y git nginx build-essential python3 curl

# Install PM2 globally
sudo npm install -g pm2
```

**✅ Success:** All packages installed without errors

---

## STEP 5: Get Your Project Files to the VM

**WHERE:** Choose ONE method below

### Option A: Clone from GitHub (Recommended if your code is on GitHub)

**On the VM:**

```bash
cd ~
git clone https://github.com/YOUR-USERNAME/v0-tos.git intern-attendance
cd intern-attendance
```

**⚠️ Replace `YOUR-USERNAME` with your actual GitHub username!**

### Option B: Upload Files from Your Local Computer

**On your LOCAL computer (new terminal window):**

```bash
# Navigate to your project folder
cd /Users/wanadiba/v0-tos

# Upload all files to VM
scp -r * user@192.168.1.113:/home/user/intern-attendance/
```

**Then on the VM:**

```bash
cd ~/intern-attendance
```

### Option C: Manual Upload via Proxmox Web Interface

1. Open Proxmox web interface: `https://192.168.1.20:8006`
2. Select your VM
3. Go to Hardware → Add → USB Device
4. Or use the file manager in Ubuntu Desktop if you have GUI access

**✅ Success:** You should be in the project directory with all files

---

## STEP 6: Make Scripts Executable

**WHERE:** On the VM, in the project directory

**WHAT TO DO:**

```bash
# Make sure you're in the project directory
cd ~/intern-attendance

# Make scripts executable
chmod +x deploy-proxmox.sh
chmod +x setup-env-proxmox.sh
```

**✅ Success:** Scripts are now executable

---

## STEP 7: Run the Deployment Script

**WHERE:** On the VM, in the project directory

**WHAT TO DO:**

```bash
./deploy-proxmox.sh
```

**This script will:**
- ✅ Install all dependencies
- ✅ Build your application
- ✅ Setup PM2
- ✅ Configure Nginx
- ✅ Setup firewall

**⚠️ Important:** 
- The script will ask you to configure `.env` file
- You can skip this for now and configure it later (Step 8)

**✅ Success:** Script completes without major errors

---

## STEP 8: Configure Environment Variables

**WHERE:** On the VM

**WHAT TO DO:**

**Option A: Use the interactive script**

```bash
cd ~/intern-attendance
./setup-env-proxmox.sh
```

Follow the prompts to enter:
- Gmail address
- Gmail App Password (get from: https://myaccount.google.com/apppasswords)
- Optional: Twilio credentials

**Option B: Manual configuration**

```bash
cd /var/www/intern-attendance
nano .env
```

Paste this and update with your values:

```env
NODE_ENV=production
PORT=3000
DATABASE_PATH=/var/www/intern-attendance/data/attendance.db

GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-gmail-app-password
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

**✅ Success:** `.env` file created with your credentials

---

## STEP 9: Rebuild Application with New Config

**WHERE:** On the VM

**WHAT TO DO:**

```bash
cd /var/www/intern-attendance
npm run build
pm2 restart intern-attendance-system
```

**✅ Success:** Application rebuilt and restarted

---

## STEP 10: Initialize Database

**WHERE:** On the VM

**WHAT TO DO:**

```bash
cd /var/www/intern-attendance
npm run db:init
```

**✅ Success:** Database created at `/var/www/intern-attendance/data/attendance.db`

---

## STEP 11: Setup PM2 Auto-Start

**WHERE:** On the VM

**WHAT TO DO:**

```bash
pm2 startup
```

**This will show you a command like:**
```
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u user --hp /home/user
```

**Copy and run that exact command** (it will be different for you):

```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u user --hp /home/user
```

**Then save PM2 configuration:**

```bash
pm2 save
```

**✅ Success:** PM2 will start automatically on VM reboot

---

## STEP 12: Verify Everything is Running

**WHERE:** On the VM

**WHAT TO DO:**

```bash
# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Check if app responds
curl http://localhost:3000
```

**✅ Success:** 
- PM2 shows app as "online"
- Nginx shows as "active (running)"
- curl returns HTML (not error)

---

## STEP 13: Access Your Application

**WHERE:** On any computer/device on the same network

**WHAT TO DO:**

Open a web browser and go to:

```
http://192.168.1.113
```

**OR**

```
http://192.168.1.114
```

**✅ Success:** You should see your login page!

---

## Troubleshooting

### Can't connect via SSH (Step 1)

**Check on VM (if you have GUI access):**
```bash
sudo systemctl status ssh
sudo systemctl enable ssh
sudo systemctl start ssh
```

### Script fails during deployment

**Check logs:**
```bash
pm2 logs intern-attendance-system
sudo journalctl -u nginx
```

### Can't access application in browser

**Check on VM:**
```bash
# Check if PM2 is running
pm2 status

# Check if Nginx is running
sudo systemctl status nginx

# Check firewall
sudo ufw status

# Check if port 3000 is listening
sudo netstat -tulpn | grep 3000
```

### Permission errors

**Fix ownership:**
```bash
sudo chown -R $USER:$USER /var/www/intern-attendance
```

---

## Quick Reference: Where to Run Commands

| Step | Location | Terminal |
|------|----------|----------|
| Step 1 | Your local computer | Your local terminal |
| Steps 2-13 | VM (via SSH) | SSH session to VM |

---

## Summary Checklist

- [ ] Connected to VM via SSH
- [ ] Updated system packages
- [ ] Installed Node.js 18.x
- [ ] Installed Git, Nginx, PM2
- [ ] Cloned/uploaded project files
- [ ] Ran deployment script
- [ ] Configured .env file
- [ ] Rebuilt application
- [ ] Initialized database
- [ ] Setup PM2 auto-start
- [ ] Verified everything running
- [ ] Accessed application in browser

---

**🎉 Once you complete all steps, your system will be production-ready!**

**Need help?** Check the logs:
- `pm2 logs intern-attendance-system`
- `sudo tail -f /var/log/nginx/error.log`


