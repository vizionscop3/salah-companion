# **Branch Protection Setup Guide**

## **📋 Set Up Branch Protection for `main`**

Branch protection helps maintain code quality by requiring reviews and checks before merging.

### **Step 1: Navigate to Branch Settings**

1. Visit: https://github.com/vizionscop3/salah-companion/settings/branches
2. Click **"Add rule"** or **"Add branch protection rule"**

### **Step 2: Configure Branch Name Pattern**

- **Branch name pattern**: `main`
- This will protect the main branch

### **Step 3: Configure Protection Rules**

Enable the following options:

#### **Required Pull Request Reviews**
- ✅ **Require a pull request before merging**
- ✅ **Required approvals**: `1` (or more as needed)
- ✅ **Dismiss stale pull request approvals when new commits are pushed**
- ✅ **Require review from Code Owners** (if using CODEOWNERS file)

#### **Require Status Checks**
- ✅ **Require status checks to pass before merging**
- Select checks:
  - `TypeScript` (type-check)
  - `Lint` (if configured)
  - `Tests` (if configured)
- ✅ **Require branches to be up to date before merging**

#### **Restrictions**
- ✅ **Include administrators** (applies rules to admins too)
- (Optional) **Restrict who can push to matching branches** - Leave unchecked for now

#### **Other Options** (Optional)
- ⚠️ **Require conversation resolution before merging** (recommended)
- ⚠️ **Require signed commits** (advanced security)
- ⚠️ **Require linear history** (keeps history clean)
- ⚠️ **Do not allow bypassing the above settings** (strict mode)

### **Step 4: Save**

Click **"Create"** or **"Save changes"**

## **✅ What This Does**

After setup:
- ✅ All changes to `main` must go through pull requests
- ✅ Pull requests require at least 1 approval
- ✅ CI checks must pass before merging
- ✅ Branches must be up to date
- ✅ Code owners are automatically requested for review

## **📊 Example Workflow**

1. Developer creates feature branch
2. Makes changes and pushes
3. Opens pull request
4. CI runs automatically
5. Code owner reviews
6. After approval and CI passes, merge is allowed

## **⚠️ Important Notes**

- **Include administrators**: If checked, even admins must follow rules
- **Status checks**: These will appear after workflows run at least once
- **Code owners**: Uses `.github/CODEOWNERS` file for automatic reviewer assignment

## **🔧 Adjusting Rules Later**

You can always modify these rules later:
1. Go to Settings → Branches
2. Click on the `main` branch rule
3. Edit settings
4. Save changes

---

**Status**: Branch protection is optional but highly recommended for production codebases.

