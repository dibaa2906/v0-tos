#!/bin/bash

# Production Deployment Script for Proxmox VM
# Ubuntu Desktop 24.04 LTS
# Run this script on your VM after initial setup

set -e  # Exit on error

echo "🚀 Starting Production Deployment for Proxmox VM..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root or with sudo
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}❌ Please do not run this script as root. Run as regular user with sudo access.${NC}"
    exit 1
fi

# Variables
APP_DIR="/var/www/intern-attendance"
REPO_URL="https://github.com/your-username/v0-tos.git"  # Update with your repo URL

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "  App Directory: $APP_DIR"
echo "  Repository: $REPO_URL"
echo ""

# Step 1: Update system
echo -e "${GREEN}Step 1: Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Step 2: Install Node.js 18.x
echo -e "${GREEN}Step 2: Installing Node.js 18.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "Node.js already installed: $(node --version)"
fi

# Verify Node.js installation
NODE_VERSION=$(node --version)
echo "✅ Node.js version: $NODE_VERSION"

# Step 3: Install required packages
echo -e "${GREEN}Step 3: Installing required system packages...${NC}"
sudo apt install -y git nginx build-essential python3 curl

# Step 4: Install PM2 globally
echo -e "${GREEN}Step 4: Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
else
    echo "PM2 already installed: $(pm2 --version)"
fi

# Step 5: Create app directory
echo -e "${GREEN}Step 5: Setting up application directory...${NC}"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Step 6: Clone or update repository
echo -e "${GREEN}Step 6: Cloning/updating repository...${NC}"
if [ -d "$APP_DIR/.git" ]; then
    echo "Repository exists, pulling latest changes..."
    cd $APP_DIR
    git pull
else
    echo "Cloning repository..."
    cd /var/www
    git clone $REPO_URL intern-attendance
    cd $APP_DIR
fi

# Step 7: Install dependencies
echo -e "${GREEN}Step 7: Installing Node.js dependencies...${NC}"
npm install

# Step 8: Create necessary directories
echo -e "${GREEN}Step 8: Creating necessary directories...${NC}"
mkdir -p logs data

# Step 9: Check for .env file
echo -e "${GREEN}Step 9: Checking environment configuration...${NC}"
if [ ! -f "$APP_DIR/.env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating template...${NC}"
    cat > $APP_DIR/.env << EOF
# Application
NODE_ENV=production
PORT=3000
DATABASE_PATH=$APP_DIR/data/attendance.db

# Email Configuration (Gmail)
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-gmail-app-password

# Optional: Twilio SMS
# TWILIO_ACCOUNT_SID=your-twilio-sid
# TWILIO_AUTH_TOKEN=your-twilio-token
# TWILIO_PHONE_NUMBER=your-twilio-number
EOF
    echo -e "${YELLOW}⚠️  Please edit $APP_DIR/.env and add your configuration before continuing.${NC}"
    echo "Press Enter after you've configured .env file..."
    read
else
    echo "✅ .env file found"
fi

# Step 10: Build application
echo -e "${GREEN}Step 10: Building application for production...${NC}"
npm run build

# Step 11: Initialize database
echo -e "${GREEN}Step 11: Initializing database...${NC}"
if [ ! -f "$APP_DIR/data/attendance.db" ]; then
    npm run db:init
    echo "✅ Database initialized"
else
    echo "✅ Database already exists"
fi

# Step 12: Setup PM2
echo -e "${GREEN}Step 12: Configuring PM2...${NC}"
cd $APP_DIR

# Stop existing PM2 process if running
pm2 delete intern-attendance-system 2>/dev/null || true

# Update ecosystem.config.js path
export APP_PATH=$APP_DIR
export NODE_ENV=production

# Start with PM2
pm2 start ecosystem.config.js
pm2 save

# Setup PM2 startup script
echo -e "${YELLOW}⚠️  PM2 startup command (run this after script completes):${NC}"
echo "  pm2 startup"
echo "  (Then run the sudo command it provides)"

# Step 13: Configure Nginx
echo -e "${GREEN}Step 13: Configuring Nginx...${NC}"
NGINX_CONFIG="/etc/nginx/sites-available/intern-attendance"

# Get VM IP address
VM_IP=$(hostname -I | awk '{print $1}')
echo "Detected VM IP: $VM_IP"

sudo tee $NGINX_CONFIG > /dev/null << EOF
server {
    listen 80;
    server_name $VM_IP;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
sudo ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/intern-attendance
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Step 14: Configure Firewall
echo -e "${GREEN}Step 14: Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    echo "y" | sudo ufw enable
    echo "✅ Firewall configured"
else
    echo -e "${YELLOW}⚠️  UFW not installed. Install with: sudo apt install ufw${NC}"
fi

# Step 15: Final status check
echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "📊 Status Check:"
pm2 status
echo ""
echo "🌐 Application URLs:"
echo "  Local: http://localhost:3000"
echo "  Network: http://$VM_IP"
echo ""
echo "📝 Next Steps:"
echo "  1. Configure .env file with your email credentials"
echo "  2. Run: pm2 startup (then run the sudo command it provides)"
echo "  3. Test the application at http://$VM_IP"
echo "  4. Create admin account using: npm run db:init"
echo ""
echo "🔧 Useful Commands:"
echo "  pm2 logs intern-attendance-system    # View logs"
echo "  pm2 restart intern-attendance-system  # Restart app"
echo "  sudo systemctl status nginx            # Check Nginx"
echo "  sudo tail -f /var/log/nginx/error.log # Nginx errors"
echo ""


