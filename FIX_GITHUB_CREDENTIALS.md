# Fix GitHub Credentials - Step by Step

## Step 1: Check Current Git Configuration

Run this command to see what's currently set:

```bash
git config user.name
git config user.email
```

## Step 2: Update Git Credentials

### If credentials are wrong or missing:

```bash
# Set your name (use your actual name or GitHub username)
git config user.name "mnasarudin"

# Set your email (use the email associated with your GitHub account)
git config user.email "your-email@example.com"
```

**Important:** Use the email that's associated with your GitHub account!

### To check what email is on your GitHub account:
1. Go to: https://github.com/settings/emails
2. Copy the email address shown there
3. Use that email in the command above

## Step 3: Verify Credentials

```bash
git config user.name
git config user.email
```

Should show your correct name and email.

## Step 4: Try Pushing Again

```bash
git add .
git commit -m "Fix Railway deployment crash"
git push origin main
```

## If Still Getting Permission Denied

### Option A: Use Personal Access Token

1. **Go to GitHub:** https://github.com/settings/tokens
2. **Click "Generate new token"** → **"Generate new token (classic)"**
3. **Name:** `railway-deploy`
4. **Select scopes:** Check `repo` (full control)
5. **Click "Generate token"**
6. **Copy the token** (you won't see it again!)

7. **Update git remote URL:**
   ```bash
   git remote set-url origin https://YOUR_TOKEN@github.com/mnasarudin/v0-tos.git
   ```
   Replace `YOUR_TOKEN` with the token you copied.

8. **Try pushing:**
   ```bash
   git push origin main
   ```

### Option B: Use SSH Instead

1. **Check if you have SSH key:**
   ```bash
   ls -la ~/.ssh
   ```

2. **If no SSH key, generate one:**
   ```bash
   ssh-keygen -t ed25519 -C "your-email@example.com"
   ```
   (Press Enter for all prompts)

3. **Copy your public key:**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

4. **Add to GitHub:**
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste the key
   - Save

5. **Change remote to SSH:**
   ```bash
   git remote set-url origin git@github.com:mnasarudin/v0-tos.git
   ```

6. **Try pushing:**
   ```bash
   git push origin main
   ```

## Quick Commands Summary

```bash
# Check current config
git config user.name
git config user.email

# Update config
git config user.name "mnasarudin"
git config user.email "your-github-email@example.com"

# Verify
git config --list | grep user

# Push
git add .
git commit -m "Fix Railway deployment"
git push origin main
```

## Need Help?

If you're still having issues:
1. Check if you have write access to `mnasarudin/v0-tos` repository
2. If not, ask the repository owner for access
3. Or fork the repo to your own account and update Railway to deploy from your fork

