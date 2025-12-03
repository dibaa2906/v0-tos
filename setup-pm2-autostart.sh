#!/bin/bash

# Setup script to enable PM2 auto-start on system boot
# This script will configure PM2 to automatically start your server when your Mac boots up

echo "🚀 Setting up PM2 auto-start..."
echo ""

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 is not installed. Please install it first:"
    echo "   npm install -g pm2"
    exit 1
fi

# Build the app if not already built
echo "📦 Checking if app is built..."
if [ ! -d ".next" ]; then
    echo "   Building the app..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Build failed. Please fix build errors first."
        exit 1
    fi
    echo "✅ Build complete!"
else
    echo "✅ App is already built"
fi

# Stop any existing PM2 processes for this app
echo ""
echo "🛑 Stopping existing PM2 processes..."
pm2 delete intern-attendance-system 2>/dev/null || true

# Start the app with PM2
echo ""
echo "▶️  Starting the app with PM2..."
pm2 start ecosystem.config.js

# Save the PM2 process list
echo ""
echo "💾 Saving PM2 process list..."
pm2 save

# Setup startup script
echo ""
echo "⚙️  Setting up auto-start on boot..."
echo "   You will need to run the following command with sudo:"
echo ""
echo "   sudo env PATH=\$PATH:/opt/homebrew/Cellar/node/24.8.0/bin /opt/homebrew/lib/node_modules/pm2/bin/pm2 startup launchd -u wanadiba --hp /Users/wanadiba"
echo ""
read -p "Do you want to run this command now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo env PATH=$PATH:/opt/homebrew/Cellar/node/24.8.0/bin /opt/homebrew/lib/node_modules/pm2/bin/pm2 startup launchd -u wanadiba --hp /Users/wanadiba
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Auto-start configured successfully!"
    else
        echo ""
        echo "⚠️  Auto-start setup failed. You may need to run the command manually."
    fi
else
    echo ""
    echo "⚠️  Please run the sudo command manually to enable auto-start on boot."
fi

echo ""
echo "📊 Current PM2 status:"
pm2 list

echo ""
echo "✅ Setup complete!"
echo ""
echo "Useful commands:"
echo "  - View logs: pm2 logs intern-attendance-system"
echo "  - Restart: pm2 restart intern-attendance-system"
echo "  - Stop: pm2 stop intern-attendance-system"
echo "  - Status: pm2 status"
echo ""


