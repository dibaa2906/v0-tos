#!/bin/bash

echo "📧 Email Configuration Setup"
echo "=================================="
echo ""

# Check if .env.local already exists
if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/n): " ANSWER
    if [ "$ANSWER" != "y" ] && [ "$ANSWER" != "Y" ]; then
        echo "Keeping existing file. Exiting."
        exit 0
    fi
fi

echo ""
echo "📝 Step 1: Enter your email details"
echo ""

read -p "Email Provider [gmail/outlook/yahoo/custom]: " PROVIDER

case $PROVIDER in
    gmail)
        EMAIL_HOST="smtp.gmail.com"
        EMAIL_PORT="587"
        ;;
    outlook)
        EMAIL_HOST="smtp.office365.com"
        EMAIL_PORT="587"
        ;;
    yahoo)
        EMAIL_HOST="smtp.mail.yahoo.com"
        EMAIL_PORT="587"
        ;;
    custom)
        read -p "SMTP Host: " EMAIL_HOST
        read -p "SMTP Port: " EMAIL_PORT
        ;;
    *)
        echo "Invalid option. Using Gmail defaults."
        EMAIL_HOST="smtp.gmail.com"
        EMAIL_PORT="587"
        ;;
esac

echo ""
read -p "Your email address: " EMAIL_USER

echo ""
echo "📝 Step 2: Get App Password"
echo ""
echo "For Gmail:"
echo "  1. Go to: https://myaccount.google.com/apppasswords"
echo "  2. Enable 2-Step Verification if not enabled"
echo "  3. Generate App Password for 'Mail'"
echo "  4. Copy the 16-character password"
echo ""
read -p "Paste your App Password here: " EMAIL_PASS

echo ""
echo "Creating .env.local file..."
cat > .env.local << EOF
# Email Configuration
EMAIL_HOST=$EMAIL_HOST
EMAIL_PORT=$EMAIL_PORT
EMAIL_USER=$EMAIL_USER
EMAIL_PASS=$EMAIL_PASS
EOF

echo ""
echo "✅ .env.local created successfully!"
echo ""
echo "📝 Step 3: Rebuild and restart"
echo ""
read -p "Do you want to rebuild and restart now? (y/n): " REBUILD

if [ "$REBUILD" = "y" ] || [ "$REBUILD" = "Y" ]; then
    echo ""
    echo "Building application..."
    npm run build
    echo ""
    echo "Restarting application..."
    npx pm2 restart intern-attendance-system
    echo ""
    echo "✅ Done! Your email configuration is now active!"
else
    echo ""
    echo "Remember to run:"
    echo "  npm run build && npx pm2 restart intern-attendance-system"
fi

echo ""
echo "📧 Test email by signing up at: http://localhost:3000/signup"





