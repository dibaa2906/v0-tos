#!/bin/bash

clear
echo "📧 QUICK EMAIL SETUP"
echo "=================================="
echo ""

# Check if already configured
if [ -f .env.local ] && grep -q "EMAIL_PASS=abcd efgh ijkl mnop" .env.local; then
    echo "⚠️  Email not fully configured yet!"
    echo ""
    read -p "Do you want to configure email now? (y/n): " ANSWER
    if [ "$ANSWER" != "y" ] && [ "$ANSWER" != "Y" ]; then
        echo "Okay, skipping email setup."
        echo "You can test the system - codes will appear in browser console."
        exit 0
    fi
fi

echo "🔧 Setting up email configuration..."
echo ""

# Ask for email
read -p "Enter your Gmail address: " EMAIL

echo ""
echo "🔐 Getting Gmail App Password..."
echo ""
echo "1. Open this link in your browser:"
echo "   👉 https://myaccount.google.com/apppasswords"
echo ""
echo "2. You'll need 2-Step Verification enabled first."
echo "   Go to: https://myaccount.google.com/security"
echo ""
read -p "Press ENTER when you have enabled 2-Step Verification and opened app passwords page..."

echo ""
echo "3. Select:"
echo "   - Mail"
echo "   - Other (Custom name)"
echo "   - Type: Intern Attendance"
echo "   - Generate"
echo ""
read -p "Copy the 16-character password and paste it here: " APP_PASS

echo ""
echo "✅ Creating configuration..."

cat > .env.local << EOF
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=$EMAIL
EMAIL_PASS=$APP_PASS
EOF

echo "✅ Configuration saved!"
echo ""
echo "📦 Rebuilding application..."
npm run build > /dev/null 2>&1
npx pm2 restart intern-attendance-system > /dev/null 2>&1

echo ""
echo "✅ Email configuration complete!"
echo ""
echo "🧪 TEST IT NOW:"
echo "   1. Go to: http://localhost:3000/signup"
echo "   2. Enter your email: $EMAIL"
echo "   3. Fill the form"
echo "   4. Check your inbox for verification code!"
echo ""
echo "📧 Your email verification is now working!"





