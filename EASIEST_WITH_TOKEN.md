# 🎯 Easiest Way (Since Uploads Are Disabled)

Since you don't have write access, use a **Personal Access Token**. It's still easy!

## Step-by-Step (5 minutes)

### Step 1: Create Token (2 minutes)

1. **Go to:** https://github.com/settings/tokens
2. **Click:** "Generate new token" → "Generate new token (classic)"
3. **Name:** `railway-deploy` (or any name)
4. **Expiration:** 90 days (or No expiration)
5. **Check this box:** ✅ `repo` (gives full repository access)
6. **Scroll down** → Click **"Generate token"**
7. **COPY THE TOKEN** - It looks like: `ghp_xxxxxxxxxxxxxxxxxxxx`
   - ⚠️ You won't see it again! Copy it now!

### Step 2: Update Git Remote (30 seconds)

Open your terminal and run this command (replace `YOUR_TOKEN` with the token you copied):

```bash
git remote set-url origin https://YOUR_TOKEN@github.com/mnasarudin/v0-tos.git
```

**Example:**
```bash
git remote set-url origin https://ghp_abc123xyz789@github.com/mnasarudin/v0-tos.git
```

### Step 3: Push Code (30 seconds)

```bash
git add .
git commit -m "Fix Railway deployment crash"
git push origin main
```

### Step 4: Done! ✅

- Railway will auto-deploy
- Wait 2-3 minutes
- Check Railway dashboard

---

## If You Get Errors

### Error: "remote: Invalid username or password"
- Make sure you copied the **entire token** (starts with `ghp_`)
- Make sure there are **no spaces** in the URL

### Error: "Permission denied"
- Make sure you checked ✅ `repo` scope when creating token
- Try creating a new token with `repo` scope

### Error: "Repository not found"
- Check that the repository URL is correct: `mnasarudin/v0-tos`
- Make sure the token has `repo` access

---

## Quick Copy-Paste Commands

After you create the token, just run these 3 commands:

```bash
# 1. Update remote (replace YOUR_TOKEN with your actual token)
git remote set-url origin https://YOUR_TOKEN@github.com/mnasarudin/v0-tos.git

# 2. Stage files
git add .

# 3. Commit and push
git commit -m "Fix Railway deployment crash"
git push origin main
```

That's it! 🚀

