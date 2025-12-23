#!/bin/bash

# Quick Environment Setup Script for Proxmox VM
# This helps you configure .env file interactively

APP_DIR="/var/www/intern-attendance"
ENV_FILE="$APP_DIR/.env"

echo "🔧 Environment Configuration Setup"
echo ""

# Check if .env exists
if [ -f "$ENV_FILE" ]; then
    echo "⚠️  .env file already exists at: $ENV_FILE"
    read -p "Do you want to overwrite it? (y/N): " overwrite
    if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
        echo "Exiting. No changes made."
        exit 0
    fi
fi

# Get VM IP
VM_IP=$(hostname -I | awk '{print $1}')

# Get Gmail credentials
echo "📧 Email Configuration (Gmail)"
echo "   You need a Gmail App Password (not your regular password)"
echo "   Get it from: https://myaccount.google.com/apppasswords"
echo ""
read -p "Gmail address: " gmail_user
read -sp "Gmail App Password: " gmail_pass
echo ""

# Optional Twilio
echo ""
read -p "Do you want to configure Twilio SMS? (y/N): " use_twilio
twilio_sid=""
twilio_token=""
twilio_phone=""

if [ "$use_twilio" = "y" ] || [ "$use_twilio" = "Y" ]; then
    read -p "Twilio Account SID: " twilio_sid
    read -sp "Twilio Auth Token: " twilio_token
    echo ""
    read -p "Twilio Phone Number (with country code): " twilio_phone
fi

# Create .env file
cat > "$ENV_FILE" << EOF
# Application Configuration
NODE_ENV=production
PORT=3000
DATABASE_PATH=$APP_DIR/data/attendance.db

# Email Configuration (Gmail)
GMAIL_USER=$gmail_user
GMAIL_PASS=$gmail_pass
EOF

# Add Twilio if configured
if [ -n "$twilio_sid" ]; then
    cat >> "$ENV_FILE" << EOF

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=$twilio_sid
TWILIO_AUTH_TOKEN=$twilio_token
TWILIO_PHONE_NUMBER=$twilio_phone
EOF
fi

# Set proper permissions
chmod 600 "$ENV_FILE"

echo ""
echo "✅ Environment file created at: $ENV_FILE"
echo ""
echo "📋 Configuration Summary:"
echo "   VM IP: $VM_IP"
echo "   Gmail: $gmail_user"
if [ -n "$twilio_sid" ]; then
    echo "   Twilio: Configured"
fi
echo ""
echo "🔒 File permissions set to 600 (read/write owner only)"
echo ""


