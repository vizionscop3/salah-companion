#!/bin/bash
# Automated iOS App Launch Script
# Builds, installs, and launches the app on iPhone 17 simulator
# Usage: ./scripts/launch-ios-app.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🚀 iOS App Launch Automation"
echo "============================"
echo ""

# Configuration
SIMULATOR_NAME="iPhone 17"
BUNDLE_ID="org.reactjs.native.example.SalahCompanion"
APP_NAME="SalahCompanion"

# Step 1: Find iPhone 17 simulator
echo "📱 Step 1: Finding iPhone 17 simulator..."
IPHONE17_UDID=$(xcrun simctl list devices available | grep "$SIMULATOR_NAME" | grep -v "Pro" | grep -v "Max" | head -1 | grep -oE '[A-F0-9-]{36}' | head -1)

if [ -z "$IPHONE17_UDID" ]; then
    echo "❌ iPhone 17 simulator not found"
    echo "Available devices:"
    xcrun simctl list devices available | grep "iPhone" | head -10
    exit 1
fi

echo "✅ Found: $SIMULATOR_NAME (UDID: $IPHONE17_UDID)"

# Step 2: Boot simulator if not already booted
echo ""
echo "🔌 Step 2: Booting simulator..."
if xcrun simctl list devices booted | grep -q "$IPHONE17_UDID"; then
    echo "✅ Simulator already booted"
else
    echo "🚀 Booting simulator..."
    xcrun simctl boot "$IPHONE17_UDID" 2>/dev/null || true
    sleep 3
    echo "✅ Simulator booted"
fi

# Step 3: Create JavaScript bundle
echo ""
echo "📦 Step 3: Creating JavaScript bundle..."
if [ ! -f "ios/SalahCompanion/main.jsbundle" ]; then
    echo "   Bundle not found, creating..."
    npm run bundle:ios
else
    BUNDLE_AGE=$(($(date +%s) - $(stat -f %m "ios/SalahCompanion/main.jsbundle" 2>/dev/null || echo 0)))
    if [ "$BUNDLE_AGE" -gt 3600 ]; then
        echo "   Bundle is older than 1 hour, regenerating..."
        npm run bundle:ios
    else
        echo "✅ Bundle exists and is recent"
    fi
fi

# Step 4: Build the app
echo ""
echo "🔨 Step 4: Building iOS app..."
APP_PATH="ios/build/Build/Products/Debug-iphonesimulator/${APP_NAME}.app"

if [ ! -d "$APP_PATH" ]; then
    echo "   App not built, building now..."
    echo "   This may take a few minutes..."
    npx react-native run-ios --simulator="$SIMULATOR_NAME" --udid="$IPHONE17_UDID" --no-packager 2>&1 | tee /tmp/ios-build.log | grep -E "(Building|error|warning|BUILD)" || true
else
    echo "✅ App already built"
fi

# Step 5: Fix Hermes framework if needed
echo ""
echo "🔧 Step 5: Checking Hermes framework..."
HERMES_FRAMEWORK="${APP_PATH}/Frameworks/hermes.framework"
if [ ! -f "${HERMES_FRAMEWORK}/Info.plist" ] || [ ! -f "${HERMES_FRAMEWORK}/hermes" ]; then
    echo "   Hermes framework incomplete, fixing..."
    HERMES_SOURCE=$(find ios/Pods/hermes-engine -name "hermes.framework" -type d 2>/dev/null | grep "ios-arm64_x86_64-simulator" | head -1)
    if [ -n "$HERMES_SOURCE" ] && [ -d "$HERMES_SOURCE" ]; then
        rm -rf "$HERMES_FRAMEWORK" 2>/dev/null || true
        ditto "$HERMES_SOURCE" "$HERMES_FRAMEWORK"
        echo "✅ Hermes framework fixed"
    else
        echo "⚠️  Hermes source not found, but continuing..."
    fi
else
    echo "✅ Hermes framework is valid"
fi

# Step 6: Ensure bundle is in app
echo ""
echo "📦 Step 6: Ensuring bundle is in app..."
if [ ! -f "${APP_PATH}/main.jsbundle" ]; then
    echo "   Copying bundle to app..."
    cp "ios/SalahCompanion/main.jsbundle" "${APP_PATH}/main.jsbundle"
    echo "✅ Bundle copied to app"
else
    echo "✅ Bundle already in app"
fi

# Step 7: Install app on simulator
echo ""
echo "📥 Step 7: Installing app on simulator..."
xcrun simctl install "$IPHONE17_UDID" "$APP_PATH" 2>&1 | grep -v "already installed" || true
echo "✅ App installed"

# Step 8: Start Metro bundler (in background, but app will use local bundle)
echo ""
echo "🌐 Step 8: Starting Metro bundler (optional, app uses local bundle)..."
if ! lsof -ti:8081 > /dev/null 2>&1; then
    npm start -- --reset-cache > /tmp/metro.log 2>&1 &
    METRO_PID=$!
    echo "   Metro bundler starting (PID: $METRO_PID)"
    sleep 3
    if curl -s http://localhost:8081/status > /dev/null 2>&1; then
        echo "✅ Metro bundler ready"
    else
        echo "⚠️  Metro bundler starting (may take a moment)"
    fi
else
    echo "✅ Metro bundler already running"
fi

# Step 9: Launch the app
echo ""
echo "🚀 Step 9: Launching app..."
echo ""

# Try multiple launch methods
LAUNCH_SUCCESS=false

# Method 1: Direct launch
if xcrun simctl launch "$IPHONE17_UDID" "$BUNDLE_ID" 2>/dev/null; then
    LAUNCH_SUCCESS=true
    echo "✅ App launched successfully (Method 1)"
else
    # Method 2: Launch with console
    if xcrun simctl launch --console-pty "$IPHONE17_UDID" "$BUNDLE_ID" 2>/dev/null; then
        LAUNCH_SUCCESS=true
        echo "✅ App launched successfully (Method 2)"
    else
        # Method 3: Open Simulator and use UI
        echo "   Trying alternative launch method..."
        osascript -e 'tell application "Simulator" to activate' 2>/dev/null || true
        sleep 1
        
        # Method 4: Use simctl spawn to open the app
        xcrun simctl spawn "$IPHONE17_UDID" launchctl start "com.apple.SpringBoard" 2>/dev/null || true
        sleep 1
        
        # Try one more time
        if xcrun simctl launch "$IPHONE17_UDID" "$BUNDLE_ID" 2>/dev/null; then
            LAUNCH_SUCCESS=true
            echo "✅ App launched successfully (Method 3)"
        fi
    fi
fi

# Step 10: Final status
echo ""
echo "============================"
if [ "$LAUNCH_SUCCESS" = true ]; then
    echo "✅ SUCCESS: App should now be running!"
    echo ""
    echo "📱 Simulator: $SIMULATOR_NAME"
    echo "🔗 Bundle ID: $BUNDLE_ID"
    echo "📦 Bundle: ${APP_PATH}/main.jsbundle"
    echo ""
    echo "💡 If the app doesn't appear, check the Simulator window"
    echo "   or manually tap the SalahCompanion app icon"
else
    echo "⚠️  App installed but auto-launch failed"
    echo ""
    echo "📱 Simulator: $SIMULATOR_NAME (UDID: $IPHONE17_UDID)"
    echo "📦 App installed at: $APP_PATH"
    echo ""
    echo "💡 Please manually launch the app:"
    echo "   1. Open Simulator (should be visible)"
    echo "   2. Tap the 'SalahCompanion' app icon"
    echo ""
    echo "   Or run: xcrun simctl launch $IPHONE17_UDID $BUNDLE_ID"
fi

echo ""
echo "📋 Useful commands:"
echo "   View logs: xcrun simctl spawn $IPHONE17_UDID log stream --predicate 'processImagePath contains \"SalahCompanion\"'"
echo "   Uninstall: xcrun simctl uninstall $IPHONE17_UDID $BUNDLE_ID"
echo "   Rebuild: npm run bundle:ios && npx react-native run-ios --simulator=\"$SIMULATOR_NAME\""
echo ""

