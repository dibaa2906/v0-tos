# 📧 Email Setup - Step by Step Manual Guide

Follow these steps exactly to configure email verification.

---

## STEP 1: Create .env.local File

### On Mac/Linux:
```bash
nano .env.local
```

### On Windows:
```bash
notepad .env.local
```

Or use any text editor you prefer!

**What to do:**
1. Open terminal in your project directory
2. Run `nano .env.local` (or `notepad .env.local` on Windows)
3. A blank file will open

---

## STEP 2: Add Email Configuration

Copy and paste this EXACTLY into the file:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Important:** Don't change anything yet! We'll replace the placeholders in the next steps.

---

## STEP 3: Get Your Gmail App Password

### 3.1: Enable 2-Step Verification

1. Go to: **https://myaccount.google.com/security**
2. Scroll down to **"How you sign in to Google"**
3. Look for **"2-Step Verification"**
4. Click on it
5. Click **"Get Started"**
6. Enter your phone number
7. Choose verification method (Text or Voice call)
8. Enter the code you receive
9. Click **"Turn On"**

**✅ You're done with 2-Step Verification!**

### 3.2: Generate App Password

1. Go to: **https://myaccount.google.com/apppasswords**
   - If link doesn't work, go to: https://myaccount.google.com/security
   - Scroll down and click **"App Passwords"**

2. You'll see a dropdown menu
   - Select: **"Mail"**

3. Another dropdown appears
   - Select: **"Other (Custom name)"**

4. A text box appears
   - Type: **"Intern Attendance System"** (or any name you want)

5. Click the **"Generate"** button

6. **COPY THE 16-CHARACTER PASSWORD**
   - It looks like: `abcd efgh ijkl mnop`
   - Or: `abcdefghijklmnop`
   - Copy it now! You won't see it again!

---

## STEP 4: Edit .env.local File

Go back to your `.env.local` file and make these changes:

### 4.1: Replace Email Address

Find this line:
```env
EMAIL_USER=your-email@gmail.com
```

Change it to YOUR actual email:
```env
EMAIL_USER=yourname@gmail.com
```

**Replace `your-email@gmail.com` with your real Gmail address!**

### 4.2: Replace App Password

Find this line:
```env
EMAIL_PASS=your-app-password
```

Replace `your-app-password` with the 16-character password you copied:
```env
EMAIL_PASS=abcd efgh ijkl mnop
```

**Or if it has no spaces:**
```env
EMAIL_PASS=abcdefghijklmnop
```

---

## STEP 5: Save the File

### Using Nano (Mac/Linux):
1. Press **Ctrl + X**
2. Press **Y** (to confirm)
3. Press **Enter** (to save)

### Using Notepad (Windows):
1. Click **File** → **Save**
2. Close the file

### Using VS Code or other editors:
1. Press **Ctrl + S** (or **Cmd + S** on Mac)
2. Close the file

---

## STEP 6: Verify .env.local File

Check that your file looks like this (with YOUR actual email and password):

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=yourname@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

**Run this command to check:**
```bash
cat .env.local
```

You should see your configuration!

---

## STEP 7: Rebuild and Restart

Run these two commands:

```bash
npm run build
```

Wait for it to finish, then run:

```bash
npx pm2 restart intern-attendance-system
```

You should see:
```
✅ Done
```

---

## STEP 8: Test Email Verification!

### 8.1: Open Signup Page

1. Go to: **http://localhost:3000/signup**
2. You'll see the signup form

### 8.2: Fill Out the Form

Fill in all fields:

- **Full Name**: Your full name
- **Username**: Choose a username (unique)
- **Address**: Your address
- **Department**: Select from dropdown
- **Emergency Contact Name**: Parent/Guardian name
- **Emergency Contact Phone**: Their phone number
- **Your Email Address**: **Enter your Gmail here!**
- **Password**: Create a password
- **Confirm Password**: Same password

### 8.3: Submit and Check Email

1. Click **"Continue to Verification"**
2. You should see: **"Verification code sent to your email!"**
3. **Check your Gmail inbox!**
4. You should receive an email with your verification code
5. **Check spam folder** if you don't see it
6. **Copy the 4-digit code** from the email
7. **Paste it** in the verification field
8. Click **"Verify & Create Account"**

---

## ✅ SUCCESS!

If you received the email, your email configuration is working! 🎉

---

## 🆘 Troubleshooting

### Problem: "Email not sent" in console logs

**Solution:**
1. Check `.env.local` exists: `ls -la .env.local`
2. Check file contents: `cat .env.local`
3. Verify you didn't add spaces or quotes around values
4. Rebuild: `npm run build && npx pm2 restart intern-attendance-system`

### Problem: "Invalid credentials"

**Solution:**
1. Make sure you're using an **App Password**, not your regular Gmail password
2. Check you enabled **2-Step Verification** first
3. Generate a new app password and try again

### Problem: Email goes to spam

**Solution:**
1. Check spam folder
2. Mark as "Not Spam" if found there
3. Gmail will learn to deliver properly

### Problem: Don't receive email

**Check:**
1. Check spam folder
2. Wait 1-2 minutes
3. Check console logs: `pm2 logs intern-attendance-system`
4. Verify email address is correct in `.env.local`
5. Try resending code

### Problem: Port 587 not working

**Solution:**
Change this in `.env.local`:
```env
EMAIL_PORT=465
```

And add this line:
```env
EMAIL_SECURE=true
```

Then rebuild and restart.

---

## 🎯 Quick Reference

### Your .env.local should look like:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=youractualemail@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

### Commands to remember:
```bash
# Check configuration
cat .env.local

# Rebuild after changes
npm run build && npx pm2 restart intern-attendance-system

# Check logs if something goes wrong
pm2 logs intern-attendance-system
```

---

## 📧 That's It!

Your email verification is now configured! 

**Every time someone signs up, they'll receive a verification code via email!** 📨





