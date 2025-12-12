#!/bin/bash

# iOS SDK Fix Script for Salah Companion
# This script fixes the Xcode developer directory issue

echo "🔧 Fixing iOS SDK Configuration..."
echo ""

# Check if Xcode exists
if [ ! -d "/Applications/Xcode.app" ]; then
    echo "❌ Error: Xcode.app not found in /Applications/"
    echo "   Please install Xcode from the App Store first."
    exit 1
fi

echo "✅ Xcode.app found"
echo ""

# Switch to Xcode developer directory
echo "📝 Switching developer directory to Xcode..."
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

if [ $? -eq 0 ]; then
    echo "✅ Developer directory switched successfully"
else
    echo "❌ Failed to switch developer directory"
    exit 1
fi

echo ""
echo "🔍 Verifying configuration..."

# Verify the change
CURRENT_PATH=$(xcode-select -p)
echo "   Current path: $CURRENT_PATH"

if [ "$CURRENT_PATH" = "/Applications/Xcode.app/Contents/Developer" ]; then
    echo "✅ Developer directory is correct"
else
    echo "❌ Developer directory is still incorrect"
    exit 1
fi

# Check Xcode version
echo ""
echo "📱 Xcode version:"
xcodebuild -version

# Check iOS SDK
echo ""
echo "📱 iOS SDK path:"
xcrun --show-sdk-path --sdk iphoneos 2>&1

if [ $? -eq 0 ]; then
    echo "✅ iOS SDK found"
else
    echo "⚠️  iOS SDK not found - you may need to:"
    echo "   1. Open Xcode at least once"
    echo "   2. Accept the license agreement"
    echo "   3. Let Xcode complete any setup"
fi

echo ""
echo "🎉 iOS SDK configuration complete!"
echo ""
echo "Next steps:"
echo "  1. If you haven't accepted the Xcode license, run:"
echo "     sudo xcodebuild -license accept"
echo ""
echo "  2. Then run pod install:"
echo "     cd ios && pod install"
echo ""

