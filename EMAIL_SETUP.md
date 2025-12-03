# 📧 Email Verification Setup

## ✅ Email Verification is Now Active!

Your system now uses **EMAIL** instead of SMS for verification codes.

## 🎯 Quick Setup (Free Forever!)

### Option 1: Gmail (Easiest)

1. Create `.env.local` file in your project root:

```bash
nano .env.local
```

2. Add these lines (use your Gmail account):

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
```

**Important**: You need an **App Password**, not your regular Gmail password!

#### How to Get Gmail App Password:

1. Go to: https://myaccount.google.com/
2. Click **"Security"** in left menu
3. Under **"How you sign in to Google"**, enable **"2-Step Verification"**
4. Go back to Security page
5. Click **"App passwords"**
6. Select **"Mail"** and **"Other (Custom name)"**
7. Name it: "Intern Attendance System"
8. Click **"Generate"**
9. Copy the 16-character password
10. Paste it as `EMAIL_PASS` in `.env.local`

### Option 2: Other Email Providers

#### Outlook/Hotmail:
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

#### Yahoo:
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

#### Custom SMTP:
```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password
```

## 🚀 After Setup

1. Save `.env.local` file
2. Rebuild and restart:

```bash
npm run build
npx pm2 restart intern-attendance-system
```

## ✅ Test It!

1. Go to: http://localhost:3000/signup
2. Fill the form
3. Enter your email as "phone number"
4. Click "Continue to Verification"
5. **Check your email for the verification code!** 📧

## 🎯 Without Email Configured (Testing)

If email is not configured:
- Verification code appears in browser console
- System still works perfectly
- Users can test the system

## 📊 Current Status

```
✅ Email verification implemented
✅ Verification codes sent via email
✅ HTML formatted emails
✅ 10-minute expiry
✅ Professional email templates
✅ Free forever (no payment required!)
```

## 💡 Tips

### Gmail Daily Limits:
- 500 emails per day (free)
- More than enough for intern attendance system!

### Security:
- App passwords are safer than regular passwords
- Never commit `.env.local` to git (already ignored)

### Testing:
- Use your personal email for testing
- Check spam folder if email doesn't arrive

## 🆘 Troubleshooting

### "Email not sent"

**Check**:
1. Verify `.env.local` file exists
2. Check credentials are correct
3. Check email provider allows SMTP
4. Look at server logs: `pm2 logs intern-attendance-system`

### Gmail Issues:

**"Username and password not accepted"**:
- Make sure you use an App Password, not regular password
- Enable 2-Step Verification first

### Port Issues:

If port 587 doesn't work, try:
```env
EMAIL_PORT=465
EMAIL_SECURE=true
```

## ✅ Success!

Once configured, verification emails will be sent automatically!

**No payment required. No SMS costs. Free forever!** 🎉



