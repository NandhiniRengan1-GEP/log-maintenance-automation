# GitHub Integration Setup Guide

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `log-maintenance-automation`
3. Description: `Automated log-based code maintenance system with AI-powered error analysis and fix generation`
4. Set to **Public** or **Private** (your choice)
5. ✓ Initialize with README
6. Click **Create repository**

## Step 2: Get GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click **Generate new token** → **Generate new token (classic)**
3. Token name: `log-maintenance-automation`
4. Select scopes:
   - ✓ `repo` (Full control of private repositories)
   - ✓ `workflow` (Update GitHub Action workflows)
5. Click **Generate token**
6. **COPY THE TOKEN** (you won't see it again!)

## Step 3: Configure the System

Create a `.env` file in the root directory:

```bash
# In: C:\Users\Nandhini.Rengan\log-maintenance-automation\.env

# GitHub Configuration
GITHUB_TOKEN=ghp_YOUR_TOKEN_HERE
GITHUB_OWNER=YOUR_USERNAME
GITHUB_REPO=log-maintenance-automation

# Optional: Target repository for PRs (if different from this repo)
TARGET_GITHUB_OWNER=YOUR_USERNAME
TARGET_GITHUB_REPO=user-service
```

## Step 4: Push Code to GitHub

```powershell
# Navigate to project directory
cd C:\Users\Nandhini.Rengan\log-maintenance-automation

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Log-based code maintenance automation system"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/log-maintenance-automation.git

# Push to GitHub
git push -u origin main
```

## Step 5: Create Target Repository (for receiving PRs)

If you want to test PR creation on a separate repository:

1. Create another repository named `user-service` (or any name)
2. Add some sample code files
3. Update `.env` with the target repo details

## Step 6: Test the System

1. Start all services:
   ```powershell
   .\START-COMPLETE-SYSTEM.ps1
   ```

2. Open UI: http://localhost:4200/index-standalone.html

3. Click "Test Workflow" - it will create a real PR in your GitHub repository!

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `GITHUB_TOKEN` | Personal Access Token | `ghp_xxxxxxxxxxxx` |
| `GITHUB_OWNER` | Your GitHub username | `johndoe` |
| `GITHUB_REPO` | Repository for the system code | `log-maintenance-automation` |
| `TARGET_GITHUB_OWNER` | Owner of repo to receive PRs | `johndoe` |
| `TARGET_GITHUB_REPO` | Repository to receive PRs | `user-service` |

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` file to GitHub
- Keep your token secure
- Add `.env` to `.gitignore`
- Rotate tokens periodically
- Use repository secrets for production

## Troubleshooting

### PR Creation Fails
- Check token has `repo` scope
- Verify repository exists
- Ensure you have write access
- Check token hasn't expired

### Authentication Error
- Regenerate token
- Update `.env` file
- Restart services

## Next Steps

After setup:
1. ✓ System will create real PRs
2. ✓ PRs will appear in your GitHub repository
3. ✓ You can review, comment, and merge them
4. ✓ Full GitHub integration active!
