# Push to Your Own GitHub Repository 🚀

Quick guide to push your code to your GitHub repo.

---

## Step 1: Commit Your Changes

**📍 Mac Terminal:**

```bash
cd /Users/wanadiba/v0-tos

# Make sure you're on dev02 branch
git checkout dev02

# Add all changes (including staff directory link fix)
git add .

# Commit
git commit -m "Update staff directory link and deployment config"
```

---

## Step 2: Push to GitHub

**📍 Mac Terminal:**

```bash
cd /Users/wanadiba/v0-tos

# Push dev02 branch to your repository
git push origin dev02

# If branch doesn't exist on remote yet:
git push -u origin dev02
```

---

## Step 3: On VM - Clone Your Repository

**📍 VM Terminal:**

```bash
# Navigate to app directory
cd /var/www

# Remove old if needed (backup first)
sudo mv intern-attendance intern-attendance.backup 2>/dev/null || true

# Clone your repository with dev02 branch
git clone -b dev02 https://github.com/dibaa2906/v0-tos.git intern-attendance

# Set ownership
sudo chown -R $USER:$USER intern-attendance
cd intern-attendance

# Install dependencies
npm install

# Build
npm run build

# Create directories
mkdir -p logs data

# Copy .env from backup if needed
# cp ../intern-attendance.backup/.env .env 2>/dev/null || nano .env

# Start app
pm2 start ecosystem.config.js
pm2 save
```

---

## Update Workflow

### When You Make Changes:

**📍 Mac Terminal:**

```bash
cd /Users/wanadiba/v0-tos
git add .
git commit -m "Description of changes"
git push origin dev02
```

**📍 VM Terminal:**

```bash
cd /var/www/intern-attendance
git pull origin dev02
npm install
npm run build
pm2 restart intern-attendance-system
```

---

## Quick Commands

**Commit and Push:**
```bash
git add .
git commit -m "Your message"
git push origin dev02
```

**On VM - Update:**
```bash
git pull origin dev02
npm install && npm run build
pm2 restart intern-attendance-system
```

---

That's it! Simple workflow with your own repository. 🎉

