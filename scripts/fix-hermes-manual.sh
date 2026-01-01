#!/bin/bash

# Manual Hermes Framework Fix Script
# Use this if the automatic fix doesn't work

set -e

echo "🔧 Manual Hermes Framework Fix"
echo "==============================="

cd "$(dirname "$0")/.."

# Find Hermes framework source
HERMES_SOURCE="ios/Pods/hermes-engine/destroot/Library/Frameworks/universal/hermes.xcframework/ios-arm64_x86_64-simulator/hermes.framework"

if [ ! -d "$HERMES_SOURCE" ]; then
    echo "❌ Hermes framework not found at: $HERMES_SOURCE"
    echo "   Run: cd ios && pod install"
    exit 1
fi

echo "✅ Found Hermes framework at: $HERMES_SOURCE"

# Find build directory
BUILD_DIR=$(find ~/Library/Developer/Xcode/DerivedData/SalahCompanion-*/Build/Products/Debug-iphonesimulator/SalahCompanion.app/Frameworks -maxdepth 0 -type d 2>/dev/null | head -1)

if [ -z "$BUILD_DIR" ]; then
    echo "❌ Build directory not found. Please build the app first:"
    echo "   npm run ios"
    exit 1
fi

echo "✅ Found build directory: $BUILD_DIR"

# Create Frameworks directory if it doesn't exist
mkdir -p "$BUILD_DIR"

# Remove existing framework if it's a symlink or incomplete
if [ -L "$BUILD_DIR/hermes.framework" ] || [ -d "$BUILD_DIR/hermes.framework" ]; then
    echo "   Removing existing framework..."
    rm -rf "$BUILD_DIR/hermes.framework"
fi

# Copy framework
echo "   Copying framework..."
if ditto "$HERMES_SOURCE" "$BUILD_DIR/hermes.framework"; then
    echo "✅ Framework copied successfully"
    
    # Verify
    if [ -f "$BUILD_DIR/hermes.framework/hermes" ] && [ -f "$BUILD_DIR/hermes.framework/Info.plist" ]; then
        echo "✅ Framework verified (has binary and Info.plist)"
        echo ""
        echo "Framework location: $BUILD_DIR/hermes.framework"
        ls -lh "$BUILD_DIR/hermes.framework/hermes"
    else
        echo "⚠️  Framework copied but missing files"
        exit 1
    fi
else
    echo "❌ Failed to copy framework"
    exit 1
fi

echo ""
echo "✅ Hermes framework fix complete!"
echo "   You can now launch the app in the simulator"

