# Complete Setup and Deployment Guide

## 🎯 Objective
Configure the system to create real Pull Requests in your GitHub repository.

---

## Step 1: Install Octokit Package

```powershell
cd C:\Users\Nandhini.Rengan\log-maintenance-automation\automation-system\integrations\github-service
npm install @octokit/rest
```

---

## Step 2: Create GitHub Personal Access Token

1. **Navigate to GitHub Settings:**
   - Go to https://github.com/settings/tokens
   - Click **"Tokens (classic)"**
   - Click **"Generate new token"** → **"Generate new token (classic)"**

2. **Configure Token:**
   - **Note**: `log-maintenance-automation`
   - **Expiration**: Choose your preference (90 days recommended)
   - **Select Scopes:**
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)

3. **Generate and Copy:**
   - Click **"Generate token"**
   - **IMMEDIATELY COPY** the token (ghp_xxxxxxxxxxxx)
   - You won't be able to see it again!

---

## Step 3: Create GitHub Repository

### Option A: For This Project

1. Go to https://github.com/new
2. **Repository name**: `log-maintenance-automation`
3. **Description**: `AI-powered automated code maintenance system`
4. **Visibility**: Public or Private
5. ✅ **Initialize with README**
6. Click **"Create repository"**

### Option B: For Testing PRs (Separate Repo)

1. Create another repository named `user-service`
2. Add a simple JavaScript file:
   ```bash
   # Create src/api/users.js
   mkdir -p src/api
   echo "const users = {}; module.exports = users;" > src/api/users.js
   git add .
   git commit -m "Initial commit"
   git push
   ```

---

## Step 4: Configure Environment Variables

1. **Create `.env` file in project root:**

```powershell
cd C:\Users\Nandhini.Rengan\log-maintenance-automation
notepad .env
```

2. **Add your configuration:**

```env
# ============================================
# GitHub Configuration
# ============================================

# Your GitHub Personal Access Token (from Step 2)
GITHUB_TOKEN=ghp_your_actual_token_here

# Your GitHub username
GITHUB_OWNER=your_github_username

# Repository name for the automation system code
GITHUB_REPO=log-maintenance-automation

# ============================================
# Target Repository (where PRs will be created)
# ============================================

# Where to create fix PRs (can be same or different repo)
TARGET_GITHUB_OWNER=your_github_username
TARGET_GITHUB_REPO=user-service

# ============================================
# Service URLs (default values)
# ============================================

NEWRELIC_MCP_URL=http://localhost:3002
GITHUB_MCP_URL=http://localhost:3005
```

3. **Save and close**

---

## Step 5: Initialize Git (Optional - for hosting code)

```powershell
cd C:\Users\Nandhini.Rengan\log-maintenance-automation

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Log-based code maintenance automation"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/log-maintenance-automation.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 6: Restart Services with GitHub Integration

```powershell
# Stop all Python processes
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force

# Stop all Node processes on relevant ports
Get-Process node -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*log-maintenance-automation*"
} | Stop-Process -Force

# Start complete system
cd C:\Users\Nandhini.Rengan\log-maintenance-automation
.\START-COMPLETE-SYSTEM.ps1
```

---

## Step 7: Test Real PR Creation

1. **Open Dashboard:**
   ```
   http://localhost:4200/index-standalone.html
   ```

2. **Click "Test Workflow"**

3. **Verify PR Creation:**
   - Check console output in GitHub Service terminal
   - Look for: `✅ REAL GitHub PR created successfully!`
   - Visit: `https://github.com/YOUR_USERNAME/user-service/pulls`
   - You should see a new PR with:
     - Title: "Fix: TypeError - null reference"
     - Branch: `fix/null_reference-{timestamp}`
     - Changes to `src/api/users.js`

---

## Step 8: Verify GitHub Integration

**Check GitHub Service Status:**

```powershell
# Test health endpoint
Invoke-RestMethod http://localhost:3005/health | ConvertTo-Json
```

**Expected Output:**
```json
{
  "status": "ok",
  "service": "github-pr-service",
  "mode": "REAL_GITHUB",  ← Should say "REAL_GITHUB" not "MOCK"
  "github": {
    "configured": true,
    "owner": "your_username",
    "repo": "user-service",
    "hasToken": true
  }
}
```

---

## 🎉 Success Indicators

✅ **GitHub Service shows:**
- `mode: "REAL_GITHUB"`
- `configured: true`
- `hasToken: true`

✅ **When creating PR:**
- Console shows: `🔄 Creating REAL GitHub PR...`
- Console shows: `✅ REAL GitHub PR created successfully!`
- PR appears in GitHub repository
- PR has proper title, description, and code changes

✅ **In GitHub:**
- Pull Request is visible
- Files show correct changes
- Labels are applied (automated-fix, bug)
- Branch was created

---

## 🔍 Troubleshooting

### Issue: Mode shows "MOCK" instead of "REAL_GITHUB"

**Cause:** Environment variables not loaded

**Solution:**
```powershell
# Verify .env file exists
Test-Path C:\Users\Nandhini.Rengan\log-maintenance-automation\.env

# Verify content
Get-Content .env

# Restart GitHub service
cd automation-system/integrations/github-service
npm start
```

### Issue: "401 Bad credentials" error

**Cause:** Invalid or expired GitHub token

**Solution:**
1. Generate new token at https://github.com/settings/tokens
2. Update `GITHUB_TOKEN` in `.env`
3. Restart services

### Issue: "404 Not Found" error

**Cause:** Repository doesn't exist or wrong name

**Solution:**
1. Verify repository exists: https://github.com/YOUR_USERNAME/user-service
2. Check `TARGET_GITHUB_OWNER` and `TARGET_GITHUB_REPO` in `.env`
3. Ensure you have write access to the repository

### Issue: "Reference already exists" error

**Cause:** Branch name collision (same branch exists)

**Solution:**
- The system creates unique branch names with timestamps
- If this happens, delete old branches or wait for unique timestamp

---

## 📦 What Gets Created in GitHub

### Pull Request Structure:

```
Title: Fix: TypeError - null reference

Body:
## Automated Fix Generated by Log Maintenance System

### Error Details
- **Type**: TypeError
- **Category**: NULL_REFERENCE
- **Message**: Cannot read property 'id' of undefined

### Fix Applied
Added null check before accessing user properties...

### Changes Made
**File**: `src/api/users.js` (Line 11)

...code diff...
```

### Branch Naming:
- Format: `fix/{category}-{timestamp}`
- Example: `fix/null_reference-1699369234567`

### Labels Applied:
- `automated-fix`
- `bug`

---

## 🚀 Next Steps

1. ✅ **Review Generated PRs** in GitHub
2. ✅ **Test with Real Errors** by adding them to New Relic Mock
3. ✅ **Customize PR Templates** in github-service/server.js
4. ✅ **Add More Error Patterns** to LLM services
5. ✅ **Set Up CI/CD** for automated testing of generated fixes

---

## 📝 Configuration Reference

### Minimal .env (Same Repository):
```env
GITHUB_TOKEN=ghp_your_token
GITHUB_OWNER=your_username
GITHUB_REPO=log-maintenance-automation
```

### Full .env (Separate Target):
```env
GITHUB_TOKEN=ghp_your_token
GITHUB_OWNER=your_username
GITHUB_REPO=log-maintenance-automation
TARGET_GITHUB_OWNER=your_username
TARGET_GITHUB_REPO=user-service
```

---

## ✅ Checklist

Before testing, ensure:

- [ ] GitHub Personal Access Token created with `repo` scope
- [ ] Token copied to `.env` file as `GITHUB_TOKEN`
- [ ] GitHub username set in `GITHUB_OWNER`
- [ ] Target repository name set in `TARGET_GITHUB_REPO`
- [ ] Target repository exists on GitHub
- [ ] You have write access to target repository
- [ ] `.env` file is in project root directory
- [ ] `@octokit/rest` package installed in github-service
- [ ] All services restarted after configuration
- [ ] Health endpoint shows `mode: "REAL_GITHUB"`

---

**🎯 You're ready to create real GitHub PRs automatically!**
