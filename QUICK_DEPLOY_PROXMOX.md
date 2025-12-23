# Quick Deploy Guide - Proxmox VM (Ubuntu Desktop 24.04)

## Your VM Details
- **IP Address:** 192.168.1.113 or 192.168.1.114
- **Username:** user
- **Password:** user@123
- **OS:** Ubuntu Desktop 24.04 LTS

## Step-by-Step Deployment

### Step 1: Connect to Your VM

From your local machine, connect via SSH:

```bash
ssh user@192.168.1.113
# or
ssh user@192.168.1.114
```

Enter password: `user@123`

### Step 2: Upload Deployment Files

**Option A: Using SCP (from your local machine)**

```bash
# From your local machine (in the project directory)
scp -r * user@192.168.1.113:/home/user/intern-attendance/
```

**Option B: Clone from GitHub (recommended)**

```bash
# On the VM
cd ~
git clone https://github.com/your-username/v0-tos.git intern-attendance
cd intern-attendance
```

**Option C: Manual Upload**

1. Use Proxmox web interface to upload files
2. Or use SFTP client like FileZilla

### Step 3: Run Deployment Script

```bash
# Make script executable
chmod +x deploy-proxmox.sh

# Run deployment script
./deploy-proxmox.sh
```

The script will:
- ✅ Install Node.js 18.x
- ✅ Install Nginx, PM2, and dependencies
- ✅ Clone/build your application
- ✅ Configure PM2
- ✅ Setup Nginx reverse proxy
- ✅ Configure firewall

### Step 4: Configure Environment Variables

```bash
cd /var/www/intern-attendance
nano .env
```

Update with your actual values:

```env
NODE_ENV=production
PORT=3000
DATABASE_PATH=/var/www/intern-attendance/data/attendance.db

# Gmail Configuration
GMAIL_USER=your-actual-email@gmail.com
GMAIL_PASS=your-gmail-app-password
```

**To get Gmail App Password:**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate password for "Mail"
5. Use that password in GMAIL_PASS

### Step 5: Rebuild and Restart

```bash
cd /var/www/intern-attendance
npm run build
pm2 restart intern-attendance-system
```

### Step 6: Setup PM2 Auto-Start

```bash
pm2 startup
# Copy and run the sudo command it shows
```

### Step 7: Initialize Database

```bash
cd /var/www/intern-attendance
npm run db:init
```

### Step 8: Access Your Application

Open in browser:
- **http://192.168.1.113** (or 192.168.1.114)

## Manual Setup (If Script Fails)

### Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### Install Dependencies

```bash
sudo apt update
sudo apt install -y git nginx build-essential python3
sudo npm install -g pm2
```

### Setup Application

```bash
sudo mkdir -p /var/www/intern-attendance
sudo chown -R $USER:$USER /var/www/intern-attendance
cd /var/www/intern-attendance

# Clone or copy your files here
git clone https://github.com/your-username/v0-tos.git .

# Install and build
npm install
npm run build
mkdir -p logs data
npm run db:init
```

### Configure PM2

```bash
cd /var/www/intern-attendance
export NODE_ENV=production
export APP_PATH=/var/www/intern-attendance
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Run the sudo command it provides
```

### Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/intern-attendance
```

Paste this (replace IP with your VM IP):

```nginx
server {
    listen 80;
    server_name 192.168.1.113;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/intern-attendance /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Setup Firewall

```bash
sudo apt install -y ufw
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable
```

## Troubleshooting

### Can't connect via SSH

```bash
# On VM, check SSH service
sudo systemctl status ssh
sudo systemctl enable ssh
sudo systemctl start ssh
```

### Application not accessible

```bash
# Check PM2 status
pm2 status
pm2 logs intern-attendance-system

# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Check if port 3000 is listening
sudo netstat -tulpn | grep 3000
```

### Permission errors

```bash
# Fix ownership
sudo chown -R $USER:$USER /var/www/intern-attendance
sudo chmod -R 755 /var/www/intern-attendance
```

### Database errors

```bash
# Check database file
ls -lh /var/www/intern-attendance/data/attendance.db

# Fix permissions
chmod 664 /var/www/intern-attendance/data/attendance.db
```

## Quick Commands Reference

```bash
# PM2
pm2 status
pm2 logs intern-attendance-system
pm2 restart intern-attendance-system
pm2 stop intern-attendance-system

# Nginx
sudo systemctl status nginx
sudo systemctl restart nginx
sudo nginx -t

# Application
cd /var/www/intern-attendance
npm run build
npm run db:status
```

## Next Steps After Deployment

1. ✅ Test login/signup functionality
2. ✅ Create admin account
3. ✅ Test attendance features
4. ✅ Test email sending
5. ✅ Setup regular backups
6. ✅ Monitor logs for errors

## Access from Other Devices

To access from other devices on the same network:
- Use: `http://192.168.1.113` (or your VM IP)
- Make sure firewall allows port 80
- Make sure devices are on same network (192.168.1.x)

---

**Your system should now be accessible at http://192.168.1.113 (or 114)! 🎉**


