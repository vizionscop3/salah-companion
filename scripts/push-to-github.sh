#!/bin/bash

# Script to push Salah Companion to GitHub
# Usage: ./scripts/push-to-github.sh YOUR_GITHUB_USERNAME

set -e

GITHUB_USERNAME=$1

if [ -z "$GITHUB_USERNAME" ]; then
  echo "❌ Error: GitHub username required"
  echo "Usage: ./scripts/push-to-github.sh YOUR_GITHUB_USERNAME"
  exit 1
fi

REPO_NAME="salah-companion"
REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo "🚀 Pushing Salah Companion to GitHub"
echo "======================================"
echo ""
echo "Repository: ${REPO_URL}"
echo ""

# Check if remote already exists
if git remote get-url origin &>/dev/null; then
  echo "⚠️  Remote 'origin' already exists:"
  git remote get-url origin
  read -p "Do you want to update it? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git remote set-url origin "$REPO_URL"
    echo "✅ Remote updated"
  else
    echo "ℹ️  Using existing remote"
  fi
else
  echo "➕ Adding remote 'origin'..."
  git remote add origin "$REPO_URL"
  echo "✅ Remote added"
fi

echo ""
echo "📤 Pushing to GitHub..."
echo ""

# Push to GitHub
if git push -u origin main; then
  echo ""
  echo "✅ Successfully pushed to GitHub!"
  echo ""
  echo "🔗 Repository URL: ${REPO_URL}"
  echo ""
  echo "📋 Next steps:"
  echo "1. Visit ${REPO_URL}"
  echo "2. Enable GitHub Actions in Settings → Actions"
  echo "3. (Optional) Set up branch protection in Settings → Branches"
  echo "4. Add repository topics: react-native, islamic, prayer, mobile-app"
else
  echo ""
  echo "❌ Push failed. Common issues:"
  echo "1. Repository doesn't exist on GitHub - create it first at https://github.com/new"
  echo "2. Authentication required - you may need to set up credentials"
  echo "3. Check your internet connection"
  exit 1
fi

