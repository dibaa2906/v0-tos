# Fix "Not a Git Repository" Error

## The Problem
You're getting: `fatal: not a git repository`

This means the folder isn't connected to git, or the `.git` folder is missing.

## Solution: Initialize Git Repository

### Step 1: Initialize Git (if not already done)

```bash
cd /Users/wanadiba/v0-tos
git init
```

### Step 2: Connect to GitHub Repository

```bash
git remote add origin https://github.com/mnasarudin/v0-tos.git
```

### Step 3: Check Remote

```bash
git remote -v
```

Should show:
```
origin  https://github.com/mnasarudin/v0-tos.git (fetch)
origin  https://github.com/mnasarudin/v0-tos.git (push)
```

### Step 4: Pull Existing Code (if any)

```bash
git pull origin main
```

If you get errors, try:
```bash
git pull origin main --allow-unrelated-histories
```

### Step 5: Add Your Changes

```bash
git add .
git commit -m "Fix Railway deployment crash"
```

### Step 6: Push with Token

1. **Create token:** https://github.com/settings/tokens
   - Generate new token (classic)
   - Check `repo` scope
   - Copy token

2. **Update remote with token:**
```bash
git remote set-url origin https://YOUR_TOKEN@github.com/mnasarudin/v0-tos.git
```

3. **Push:**
```bash
git push origin main
```

---

## Alternative: If You Want Fresh Start

If you want to start fresh:

```bash
# Initialize git
git init

# Add remote
git remote add origin https://github.com/mnasarudin/v0-tos.git

# Add all files
git add .

# Commit
git commit -m "Initial commit - Railway deployment fixes"

# Push with token
git remote set-url origin https://YOUR_TOKEN@github.com/mnasarudin/v0-tos.git
git push -u origin main
```

---

## Quick Fix Commands

Run these in order:

```bash
cd /Users/wanadiba/v0-tos
git init
git remote add origin https://github.com/mnasarudin/v0-tos.git
git add .
git commit -m "Fix Railway deployment"
```

Then create token and push (see Step 6 above).

