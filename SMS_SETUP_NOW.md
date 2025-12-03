# ✅ SMS Verification Setup - URGENT

## Your verification code will ONLY be sent via SMS - never displayed on screen!

### ⚠️ Current Status
- Code is **NOT shown on screen** ✅
- Code appears in browser console (for development only)
- SMS sending **requires Twilio setup**

### 🚀 QUICK SETUP (5 minutes)

#### Step 1: Get Twilio Account
1. Go to: **https://www.twilio.com/try-twilio**
2. Sign up (FREE - no credit card needed)
3. You get $15 free credit

#### Step 2: Get Credentials
After signing in:
1. Open your Twilio Dashboard
2. Copy:
   - **Account SID** (looks like: `ACxxxxxxxxxxxxxxxxxxxx`)
   - **Auth Token** (click 👁️ eye icon to reveal)

#### Step 3: Buy a Phone Number
1. In Twilio Dashboard, click **"Phone Numbers"**
2. Click **"Buy a number"**
3. Select **Malaysia** (+60)
4. Choose a number that can send **SMS**
5. Click **"Buy"**
6. Note the number (format: `+60123456789`)

#### Step 4: Create .env.local File

Run this command to create the file:

```bash
cat > .env.local << 'EOF'
TWILIO_ACCOUNT_SID=paste_your_account_sid_here
TWILIO_AUTH_TOKEN=paste_your_auth_token_here
TWILIO_PHONE_NUMBER=paste_your_phone_number_here
EOF
```

**IMPORTANT**: Replace the placeholder text with your actual credentials!

Or manually create `.env.local` in the project root and add:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+60123456789
```

#### Step 5: Rebuild and Restart

```bash
npm run build
npx pm2 restart intern-attendance-system
```

### ✅ TEST IT!

1. Go to: **http://localhost:3000/signup**
2. Fill out the form
3. Enter your **real phone number** (where you want to receive SMS)
4. Click "Continue to Verification"
5. **Check your phone** - you'll receive an SMS with the 4-digit code!
6. The code will NOT appear on screen ✅

### 🎯 How It Works Now

**With Twilio configured:**
- Code sent via SMS only
- Not shown on screen
- SMS arrives within seconds

**Without Twilio (demo mode):**
- Code visible in browser console (developer only)
- Warning toast shown
- Not displayed to user

### 🆘 Troubleshooting

#### SMS not received
1. Check `.env.local` file has correct credentials
2. Verify phone number format includes country code: `+60123456789`
3. Check Twilio dashboard for any errors
4. Make sure number is verified (for trial accounts)

#### "Invalid credentials"
1. Double-check Account SID and Auth Token
2. No extra spaces in the file
3. Restart the app: `npx pm2 restart intern-attendance-system`

### 💰 Cost
- **Free trial**: $15 credit (perfect for testing!)
- **Per SMS**: ~$0.0075 (less than 1 cent)
- **Malaysia SMS**: ~$0.04 per message
- **Estimated monthly**: $10-20 for 50-100 users

### ✅ SUCCESS!

Once Twilio is configured:
- ✅ Codes sent via SMS only
- ✅ Not displayed on screen
- ✅ Professional phone verification
- ✅ Ready for production use!

---

**Need help?** Check `TWILIO_SETUP_GUIDE.md` for more details!



