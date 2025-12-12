# **GitHub Actions Setup Guide**

## **✅ Workflow Files Added**

The GitHub Actions workflow files have been successfully added to the repository.

## **📋 Enable GitHub Actions**

### **Step 1: Enable Workflows**

1. Visit: https://github.com/vizionscop3/salah-companion/settings/actions
2. Scroll to **"Workflow permissions"** section
3. Select:
   - ✅ **"Read and write permissions"**
   - ✅ **"Allow GitHub Actions to create and approve pull requests"**
4. Click **Save**

### **Step 2: Verify Workflows**

1. Visit: https://github.com/vizionscop3/salah-companion/actions
2. You should see:
   - **CI** workflow (runs on push/PR)
   - **Release** workflow (runs on tags)

## **🔧 Workflow Files**

### **CI Workflow** (`.github/workflows/ci.yml`)

Runs on:
- Push to `main` branch
- Pull requests
- Manual trigger

Checks:
- ✅ TypeScript type checking
- ✅ ESLint
- ✅ Code formatting (Prettier)
- ✅ Tests (when available)

### **Release Workflow** (`.github/workflows/release.yml`)

Runs on:
- Tags starting with `v*` (e.g., `v1.0.0`)

Actions:
- Creates GitHub release
- Uses CHANGELOG.md for release notes

## **📊 Workflow Status**

After enabling, you can:
- View workflow runs: https://github.com/vizionscop3/salah-companion/actions
- See status badges in README (optional)
- Monitor CI/CD pipeline

## **✅ Setup Complete**

Once enabled, workflows will automatically run on:
- Every push to `main`
- Every pull request
- Tagged releases

---

**Next**: Set up branch protection (optional but recommended)

