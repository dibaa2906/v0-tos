# Push to GitHub - Step by Step Guide

## Your Current Situation
- Git user: `dibaa2906`
- Repository: `mnasarudin/v0-tos`
- Issue: Permission denied (403 error)

## Solution: Use Personal Access Token

### Step 1: Create GitHub Personal Access Token

1. **Go to GitHub:** https://github.com/settings/tokens
2. **Click:** "Generate new token" → "Generate new token (classic)"
3. **Name it:** `railway-deploy` (or any name you like)
4. **Expiration:** Choose 90 days (or No expiration)
5. **Select scopes:** Check ✅ `repo` (this gives full repository access)
6. **Scroll down** and click **"Generate token"**
7. **IMPORTANT:** Copy the token immediately! It looks like: `ghp_xxxxxxxxxxxxxxxxxxxx`
   - You won't be able to see it again!

### Step 2: Update Git Remote URL with Token

Run this command (replace `YOUR_TOKEN` with the token you copied):

```bash
git remote set-url origin https://YOUR_TOKEN@github.com/mnasarudin/v0-tos.git
```

**Example:**
```bash
git remote set-url origin https://ghp_abc123xyz@github.com/mnasarudin/v0-tos.git
```

### Step 3: Verify Remote URL

```bash
git remote -v
```

Should show your token in the URL (it's okay, tokens are meant to be used this way).

### Step 4: Push Your Code

```bash
# Stage all changes
git add .

# Commit
git commit -m "Fix Railway deployment crash - add custom server and PORT support"

# Push
git push origin main
```

### Step 5: Verify Push

1. **Go to:** https://github.com/mnasarudin/v0-tos
2. **Check if your latest commit appears**
3. **Look for:** "Fix Railway deployment crash..."

## Alternative: If You're Not mnasarudin

If you're not the owner of `mnasarudin/v0-tos`:

### Option A: Get Write Access
- Ask `mnasarudin` to add you as a collaborator
- Go to repository → Settings → Collaborators → Add collaborator

### Option B: Fork to Your Account
1. **Go to:** https://github.com/mnasarudin/v0-tos
2. **Click "Fork"** (top right)
3. **Fork to your account** (`dibaa2906`)
4. **Update Railway** to deploy from your fork:
   - Railway → Settings → Source → Change Source
   - Select: `dibaa2906/v0-tos`

## Quick Command Summary

```bash
# 1. Create token at: https://github.com/settings/tokens

# 2. Update remote with token
git remote set-url origin https://YOUR_TOKEN@github.com/mnasarudin/v0-tos.git

# 3. Push
git add .
git commit -m "Fix Railway deployment"
git push origin main
```

## Security Note

⚠️ **Important:** Personal Access Tokens are like passwords. Don't share them publicly!

- ✅ Safe to use in git remote URL (only you can see it)
- ✅ Safe to use in Railway environment variables
- ❌ Don't commit tokens to code
- ❌ Don't share tokens publicly

## After Pushing

Once pushed:
1. **Railway will auto-deploy** (watch Railway dashboard)
2. **Wait 2-3 minutes**
3. **Check Railway logs** to see if deployment succeeds
4. **Test your app** - should work now! ✅

