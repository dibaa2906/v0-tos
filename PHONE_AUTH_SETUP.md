# Phone Authentication Setup Guide

## Overview
This guide will help you set up real phone authentication using Twilio SMS for the intern attendance system.

## Step 1: Install Twilio Package

```bash
npm install twilio
# or
pnpm add twilio
```

## Step 2: Get Twilio Account

1. **Sign up for Twilio**: Go to https://www.twilio.com/try-twilio
2. **Get your credentials**:
   - Account SID (looks like: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   - Auth Token (found in your Twilio Dashboard)
3. **Get a phone number**:
   - Go to "Phone Numbers" → "Manage" → "Buy a number"
   - Choose a number that can send SMS
   - Note the number (format: `+1234567890`)

## Step 3: Add Environment Variables

Create a `.env.local` file in your project root (or update existing one):

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

## Step 4: Update Code (Already Done)

The code has already been updated in `app/api/auth/signup/route.ts` to:
- Check for Twilio credentials
- Send SMS when credentials are available
- Fall back to demo mode when not configured

## Step 5: Test the Setup

### Without Twilio (Demo Mode)
- The system will show the verification code in a toast notification
- Perfect for testing during development

### With Twilio (Production Mode)
- After adding environment variables:
  1. Fill out the signup form
  2. Click "Continue to Verification"
  3. Receive SMS with 4-digit code on your phone
  4. Enter the code to complete signup

## Step 6: Rebuild and Restart

After adding environment variables:

```bash
npm run build
npx pm2 restart intern-attendance-system
```

## Cost Estimate

- **Twilio Trial Account**: Free (with limitations)
- **Per SMS**: ~$0.0075 per message (after trial)
- **Estimated monthly cost**: $5-20 depending on usage

## Alternative: Twilio Verify API

For a more robust solution, consider using Twilio Verify API which includes:
- Built-in retry logic
- Rate limiting protection
- Better security features
- Usage-based pricing

### To use Twilio Verify API instead:

```typescript
const twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

await twilio.verify.v2
  .services(TWILIO_VERIFY_SERVICE_SID)
  .verifications
  .create({ 
    to: phoneNumber, 
    channel: 'sms' 
  })
```

Then verify with:

```typescript
await twilio.verify.v2
  .services(TWILIO_VERIFY_SERVICE_SID)
  .verificationChecks
  .create({ 
    to: phoneNumber, 
    code: verificationCode 
  })
```

## Troubleshooting

### SMS not sending
1. Check environment variables are set correctly
2. Verify Twilio account has sufficient balance
3. Check phone number format (must include country code)
4. Review Twilio logs in dashboard

### Code not received
1. Make sure number is verified (for trial accounts)
2. Check spam/junk folder
3. Wait up to 1 minute for delivery
4. Verify phone number format matches destination

## Security Notes

1. **Never commit** `.env.local` to git
2. **Rate limit** verification attempts (already implemented in code)
3. **Expire codes** after 10 minutes (already implemented)
4. **Hash passwords** before storing (already implemented)
5. **Use HTTPS** in production for secure transmission

## Current Status

✅ **Demo mode working** - Codes shown in UI for testing
⏳ **Production mode** - Ready when Twilio credentials are added



