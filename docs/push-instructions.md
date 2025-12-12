# **Push to GitHub - Step by Step Instructions**

## **Method 1: Using GitHub CLI (Recommended - Easiest)**

If you have GitHub CLI installed:

```bash
# 1. Authenticate (if not already)
gh auth login

# 2. Create repository and push in one command
gh repo create salah-companion --public --source=. --remote=origin --push

# Or for private repository:
gh repo create salah-companion --private --source=. --remote=origin --push
```

## **Method 2: Manual Setup (Step by Step)**

### **Step 1: Create Repository on GitHub**

1. Go to https://github.com/new
2. **Repository name**: `salah-companion`
3. **Description**: "Comprehensive mobile application for Muslims learning to pray with understanding and connection"
4. **Visibility**: Choose Public or Private
5. **Important**: Do NOT check:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
6. Click **"Create repository"**

### **Step 2: Connect Local Repository**

After creating the repository, GitHub will show you commands. Use these:

**Replace `YOUR_USERNAME` with your actual GitHub username:**

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/salah-companion.git

# Verify remote
git remote -v
```

**Or if using SSH:**

```bash
git remote add origin git@github.com:YOUR_USERNAME/salah-companion.git
```

### **Step 3: Push to GitHub**

```bash
# Push main branch
git push -u origin main
```

If prompted for credentials:
- **Username**: Your GitHub username
- **Password**: Use a Personal Access Token (not your password)
  - Create token: https://github.com/settings/tokens
  - Scopes needed: `repo`

### **Step 4: Using the Helper Script**

Alternatively, use the provided script:

```bash
./scripts/push-to-github.sh YOUR_USERNAME
```

## **Method 3: Using SSH Key (Most Secure)**

If you have SSH keys set up with GitHub:

```bash
# Add remote with SSH
git remote add origin git@github.com:YOUR_USERNAME/salah-companion.git

# Push
git push -u origin main
```

## **After Pushing**

### **1. Verify Push**

Visit your repository:
```
https://github.com/YOUR_USERNAME/salah-companion
```

### **2. Enable GitHub Actions**

1. Go to repository **Settings** → **Actions** → **General**
2. Under "Workflow permissions", select:
   - ✅ "Read and write permissions"
   - ✅ "Allow GitHub Actions to create and approve pull requests"
3. Click **Save**

### **3. Set Up Branch Protection (Recommended)**

1. Go to **Settings** → **Branches**
2. Click **Add rule** for `main` branch
3. Configure:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1 reviewer)
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators
4. Click **Create**

### **4. Add Repository Topics**

1. On repository main page, click the gear icon ⚙️ next to "About"
2. Add topics:
   - `react-native`
   - `typescript`
   - `islamic`
   - `prayer`
   - `mobile-app`
   - `prisma`
   - `expo-alternative`
3. Click **Save changes**

### **5. Review Repository**

- ✅ Check that all files are present
- ✅ Verify README displays correctly
- ✅ Check that GitHub Actions workflow is visible
- ✅ Review commit history

## **Troubleshooting**

### **Authentication Issues**

If you get authentication errors:

**Option 1: Use Personal Access Token**
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select `repo` scope
4. Use token as password when pushing

**Option 2: Use GitHub CLI**
```bash
gh auth login
```

**Option 3: Use SSH**
```bash
# Generate SSH key if needed
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to GitHub: Settings → SSH and GPG keys
# Then use SSH URL for remote
```

### **Repository Already Exists**

If remote already exists:
```bash
# Check current remote
git remote -v

# Update remote URL
git remote set-url origin https://github.com/YOUR_USERNAME/salah-companion.git
```

### **Push Rejected**

If push is rejected:
```bash
# Pull first (if repository was initialized with files)
git pull origin main --allow-unrelated-histories

# Then push
git push -u origin main
```

## **Verification Checklist**

After pushing, verify:

- [ ] Repository is accessible on GitHub
- [ ] All files are present
- [ ] Commit history is visible
- [ ] README displays correctly
- [ ] GitHub Actions workflow is present
- [ ] Branch protection is set up (if enabled)
- [ ] Repository topics are added

## **Quick Reference**

```bash
# Check status
git status

# Check remote
git remote -v

# View commits
git log --oneline

# Push to GitHub
git push -u origin main

# View repository
# https://github.com/YOUR_USERNAME/salah-companion
```

---

**Need Help?** Check the main [GitHub Setup Guide](./github-setup.md) for more details.

