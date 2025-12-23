#!/bin/bash

echo "🚀 Setting up auto-start on boot..."
echo ""

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
npx pm2 save

# Setup PM2 to start on system boot
echo "⚡ Setting up PM2 to start on boot..."
echo ""
echo "You need to run this command (it requires sudo password):"
echo ""
echo "sudo env PATH=\$PATH:/opt/homebrew/Cellar/node/24.8.0/bin /Users/wanadiba/v0-tos/node_modules/pm2/bin/pm2 startup launchd -u wanadiba --hp /Users/wanadiba"
echo ""
read -p "Press ENTER to continue and run the command above, or Ctrl+C to cancel..."

sudo env PATH=$PATH:/opt/homebrew/Cellar/node/24.8.0/bin /Users/wanadiba/v0-tos/node_modules/pm2/bin/pm2 startup launchd -u wanadiba --hp /Users/wanadiba

echo ""
echo "✅ Auto-start setup complete!"
echo ""
echo "Your server will now start automatically when your Mac boots up!"
echo ""




