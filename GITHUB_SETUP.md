# GitHub Repository Setup Guide

Follow these steps to publish 4Story SQL Manager to GitHub.

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Fill in:
   - **Repository name**: `4story-sql-manager`
   - **Description**: `A lightweight, free SQL Server database management tool with Smart Search`
   - **Visibility**: Public
   - **Initialize**: Don't add README, .gitignore, or license (we already have them)
3. Click "Create repository"

## Step 2: Initialize Git and Push

Open a terminal in your project folder and run:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - v1.0.0 with Smart Search feature"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/4story-sql-manager.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Create First Release

1. Go to your repository on GitHub
2. Click "Releases" → "Create a new release"
3. Fill in:
   - **Tag version**: `v1.0.0`
   - **Release title**: `4Story SQL Manager v1.0.0`
   - **Description**:
   ```markdown
   ## 🎉 Initial Release

   A lightweight, free SQL Server management tool with Smart Search feature!

   ### ✨ Features
   - 🔍 Smart Search - search tables, functions, and row data
   - 📊 Table management with inline editing
   - ⚙️ Function/procedure editor with dark theme
   - 🔄 Copy tables between databases
   - 📋 Multi-tab workflow
   - 🛡️ Safe updates with primary key validation

   ### 📥 Installation
   1. Download `4Story-SQL-Manager-v1.0.0.zip`
   2. Extract the files
   3. Run `4Story SQL Manager.exe`

   No installation required!

   ### 📖 Documentation
   - [Features](FEATURES.md)
   - [Smart Search](SMART_SEARCH.md)
   - [Changelog](CHANGELOG.md)

   **Full Changelog**: First release
   ```
4. Upload the `ready to release` folder as a zip file:
   - Zip the entire "ready to release" folder
   - Name it: `4Story-SQL-Manager-v1.0.0.zip`
   - Attach it to the release
5. Click "Publish release"

## Step 4: Update Repository Settings

### Topics (for discoverability)
1. Go to repository homepage
2. Click the gear icon next to "About"
3. Add topics:
   - `sql-server`
   - `database-management`
   - `electron`
   - `react`
   - `sql`
   - `database-tool`
   - `fluent-ui`
   - `windows`
   - `portable`

### Description
Add this in the "About" section:
```
A lightweight, free SQL Server database management tool with Smart Search feature
```

Website: Leave blank or add your RageZone post URL

## Step 5: Add Repository Links to README

After creating the repository, update README.md:

1. Replace `YOUR_USERNAME` with your actual GitHub username
2. Commit and push:
   ```bash
   git add README.md
   git commit -m "Update GitHub links"
   git push
   ```

## Step 6: Set Up GitHub Issues

Create issue templates:

1. Go to Settings → Features → Issues → Set up templates
2. Add "Bug report" template
3. Add "Feature request" template

## Optional: Add Screenshots

To make the README more attractive:

1. Take screenshots of:
   - Main interface
   - Smart Search dialog
   - Function editor
   - Table editing
2. Create an `assets` or `screenshots` folder
3. Add images to the folder
4. Update README.md with image links:
   ```markdown
   ![Main Interface](screenshots/main.png)
   ```

## Commands Reference

### Common Git Commands

```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub
git push

# Pull latest changes
git pull

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout main
```

### Publishing Updates

```bash
# Make your changes
# Then:
git add .
git commit -m "Add new feature"
git push

# For new releases:
# 1. Update version in package.json
# 2. Update CHANGELOG.md
# 3. Commit and push
# 4. Create new release on GitHub with new tag
```

## Troubleshooting

### Authentication Issues

If you get authentication errors, use a Personal Access Token:

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` scope
3. Use token as password when pushing

Or set up SSH keys for easier authentication.

### Large File Warnings

The exe file is large (~522MB). GitHub allows files up to 100MB in the repository.

**Solution**: Don't commit the built exe to the repository!
- The `.gitignore` already excludes `dist/` and `ready to release/`
- Only upload exe in GitHub Releases (supports larger files)
- Users download from Releases, not from source code

## Next Steps

After publishing:

1. Share on RageZone with GitHub link
2. Monitor Issues for bug reports
3. Review Pull Requests from contributors
4. Update documentation as needed
5. Release new versions with bug fixes and features

---

**Ready to publish! 🚀**
