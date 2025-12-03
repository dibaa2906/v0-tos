# 📱 Setup SMS Verification - Simple Steps

## 🎯 You Need Twilio Account

Unfortunately, there's no free alternative for SMS sending. You need Twilio to enable SMS verification.

## ⏰ When You Can Access Twilio

Follow these steps (takes 5 minutes):

### Step 1: Sign Up for Twilio

1. Go to: **https://www.twilio.com/try-twilio**
2. Click "Sign Up"
3. Fill in:
   - Email address
   - Password
   - Name
4. Click "Get Started"
5. Verify your email

### Step 2: Get Your Credentials

After signing in:

1. You'll be on the Dashboard
2. **Account SID**: Top right corner, looks like `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
3. **Auth Token**: Click the eye icon to show it

**Copy both!**

### Step 3: Buy a Phone Number

1. In the left menu, click **"Phone Numbers"**
2. Click **"Buy a number"** button (top right)
3. Check **"SMS"** capability
4. Select **Malaysia (+60)** or your country
5. Click **"Search"**
6. Find a number with green checkmarks
7. Click **"Buy"**
8. Confirm the purchase

### Step 4: Add Credentials to Your App

Create a file called `.env.local` in your project root:

```bash
cd /Users/wanadiba/v0-tos
nano .env.local
```

Paste this (replace with your actual credentials):

```env
TWILIO_ACCOUNT_SID=ACyour_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+60123456789
```

Save: Press `Ctrl+X`, then `Y`, then `Enter`

### Step 5: Rebuild and Restart

```bash
npm run build
npx pm2 restart intern-attendance-system
```

### Step 6: Test!

1. Go to: http://localhost:3000/signup
2. Fill the form
3. Enter YOUR real phone number
4. Click "Continue to Verification"
5. **Check your phone for SMS!** 📱

## ✅ That's It!

Once Twilio is configured:
- ✅ Verification codes sent via SMS
- ✅ Real phone verification
- ✅ Professional setup

## 💰 Cost

- **Free trial**: $15 credit (good for testing)
- **Malaysia SMS**: ~$0.04 per message
- **Estimated**: $5-20 per month depending on usage

## 🆘 Need Help?

If you have questions about Twilio setup, the Twilio dashboard is very user-friendly with lots of help text!

---

**You can work on other features while waiting to access Twilio!** The system works fine without SMS - codes appear in browser console.



