#!/bin/bash

echo "🚀 Setting up Intern Attendance System..."
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building the application for production..."
npm run build

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Start with PM2
echo "🎯 Starting the application with PM2..."
npx pm2 start ecosystem.config.js

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
npx pm2 save

# Setup PM2 to start on system boot
echo "⚡ Setting up PM2 to start on boot..."
npx pm2 startup

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Useful commands:"
echo "  - View status: npx pm2 status"
echo "  - View logs: npx pm2 logs"
echo "  - Restart: npx pm2 restart ecosystem.config.js"
echo "  - Stop: npx pm2 stop ecosystem.config.js"
echo ""
echo "🌐 Your application is running at: http://localhost:3000"
echo ""


