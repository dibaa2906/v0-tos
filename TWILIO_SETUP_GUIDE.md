# Twilio SMS Setup Guide

## Quick Setup (5 minutes)

To enable SMS verification for your intern attendance system, you need to set up Twilio.

### Step 1: Create Twilio Account (Free)

1. Go to https://www.twilio.com/try-twilio
2. Sign up for a free account (no credit card required for trial)
3. You'll get $15 free credit to test SMS

### Step 2: Get Your Credentials

After signing up:

1. Go to your **Twilio Console Dashboard**
2. Your credentials are right there:
   - **Account SID** (looks like: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   - **Auth Token** (click the eye icon to reveal)

### Step 3: Buy a Phone Number

1. In Twilio Dashboard, go to **Phone Numbers** → **Manage** → **Buy a number**
2. Choose a number that can send **SMS**
3. Select a country (Malaysia = +60)
4. Click **Search** and pick one
5. Click **Buy**
6. Note the number (format: `+60123456789`)

### Step 4: Configure Your App

#### Option A: Using the Setup Script (Easiest)

```bash
chmod +x setup-twilio.sh
./setup-twilio.sh
```

The script will:
- Ask for your Twilio credentials
- Create `.env.local` file
- Rebuild and restart the application

#### Option B: Manual Setup

1. Create a file called `.env.local` in the project root:

```bash
nano .env.local
```

2. Add your Twilio credentials:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+60123456789
```

3. Save and exit

4. Rebuild and restart:

```bash
npm run build
npx pm2 restart intern-attendance-system
```

### Step 5: Test It!

1. Go to http://localhost:3000/signup
2. Fill out the signup form
3. Enter your **real phone number** (the number where you want to receive SMS)
4. Click "Continue to Verification"
5. **Check your phone** - you should receive an SMS with a 4-digit code!
6. Enter the code to complete signup

### ✅ Success!

If everything works:
- You'll receive an SMS with the verification code
- The code will NOT be shown on screen
- You must enter it to complete signup

### Troubleshooting

#### "Code shown on screen instead of SMS"

**Problem**: Twilio credentials not configured correctly

**Solution**:
1. Check that `.env.local` exists
2. Verify credentials are correct
3. Restart the app: `npx pm2 restart intern-attendance-system`

#### "Failed to send SMS" error

**Possible causes**:
1. **Wrong phone number format**: Must include country code (e.g., `+60123456789`)
2. **Number not verified** (for trial accounts): Go to Twilio Dashboard → Phone Numbers → Verified Caller IDs and add your number
3. **Insufficient balance**: Add funds to your Twilio account
4. **Trial account limits**: Upgrade your account or verify the recipient number

#### "Invalid Twilio credentials"

**Solution**:
1. Double-check Account SID and Auth Token
2. Make sure there are no extra spaces
3. Restart the application

### Cost Information

- **Twilio Trial**: Free $15 credit
- **Per SMS**: ~$0.0075 per message (after trial)
- **Malaysia SMS**: ~$0.04 per SMS
- **Estimated monthly**: $5-15 depending on usage

### Upgrade from Trial

1. Go to Twilio Console
2. Click on your account
3. Add a payment method
4. Verify your identity

### Next Steps

Once SMS is working, you can:

1. **Customize the message**: Edit `app/api/auth/signup/route.ts`
2. **Add rate limiting**: Prevent abuse
3. **Add international support**: Support multiple countries
4. **Add delivery status**: Track SMS delivery

### Need Help?

- Twilio Documentation: https://www.twilio.com/docs
- Twilio Support: https://support.twilio.com/



