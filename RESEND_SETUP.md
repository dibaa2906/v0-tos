# 📧 Resend.com Setup - SUPER EASY!

## ✅ Step 1: Sign Up for Free Account

1. Go to: **https://resend.com**
2. Click **"Get Started for Free"**
3. Sign up with your email
4. Verify your email

## ✅ Step 2: Get Your API Key

1. After signing up, you'll be in the dashboard
2. Click **"API Keys"** in the left menu
3. Click **"Create API Key"** button
4. Give it a name: **"Intern Attendance System"**
5. Click **"Add"**
6. **COPY YOUR API KEY NOW!**
   - It looks like: `re_AbCdEfGh123456789`
   - You won't see it again!
   - Copy it immediately!

## ✅ Step 3: Add to Your App

Edit your `.env.local` file:

```bash
nano .env.local
```

Replace the line:
```env
RESEND_API_KEY=your-api-key-here
```

With:
```env
RESEND_API_KEY=re_YOUR_ACTUAL_API_KEY
```

**Example:**
```env
RESEND_API_KEY=re_AbCdEfGh123456789
```

Save: Ctrl+X, Y, Enter

## ✅ Step 4: Rebuild and Test

```bash
npm run build
npx pm2 restart intern-attendance-system
```

## ✅ Step 5: Test Email!

1. Go to: **http://localhost:3000/signup**
2. Fill the form with any email
3. Click "Continue to Verification"
4. **Check your inbox!** 📧
5. Receive verification code via email!

## 🎉 DONE!

Your email verification is now working!

### Benefits:
- ✅ Free: 3000 emails/month
- ✅ No app passwords needed
- ✅ Just API key
- ✅ Professional emails
- ✅ Super easy setup!

### Need Help?
Check logs: `pm2 logs intern-attendance-system`



