#!/bin/bash

# iOS Device Testing Script
# Tests the app on iOS Simulator and verifies Hermes fix

set -e

echo "🍎 iOS Device Testing"
echo "====================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if Xcode is installed
check_xcode() {
    if ! command -v xcodebuild &> /dev/null; then
        echo -e "${RED}❌ Xcode not found. Please install Xcode.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Xcode found${NC}"
    xcodebuild -version | head -1
}

# Check if CocoaPods is installed
check_cocoapods() {
    if ! command -v pod &> /dev/null; then
        echo -e "${YELLOW}⚠️  CocoaPods not found. Installing...${NC}"
        sudo gem install cocoapods
    fi
    echo -e "${GREEN}✅ CocoaPods found${NC}"
    pod --version
}

# Install pods if needed
install_pods() {
    echo ""
    echo "📦 Installing CocoaPods dependencies..."
    echo "========================================"
    cd ios
    if [ ! -d "Pods" ] || [ "Podfile" -nt "Podfile.lock" ]; then
        pod install
    else
        echo -e "${GREEN}✅ Pods are up to date${NC}"
    fi
    cd ..
}

# List available simulators
list_simulators() {
    echo ""
    echo "📱 Available iOS Simulators:"
    echo "============================"
    xcrun simctl list devices available | grep -E "iPhone|iPad" | head -10
    echo ""
}

# Get default simulator
get_default_simulator() {
    # Try to find iPhone 17 Pro or latest iPhone
    DEFAULT_DEVICE=$(xcrun simctl list devices available | grep -i "iPhone" | grep -i "Pro" | head -1 | sed -E 's/.*\(([^)]+)\).*/\1/')
    
    if [ -z "$DEFAULT_DEVICE" ]; then
        DEFAULT_DEVICE=$(xcrun simctl list devices available | grep -i "iPhone" | head -1 | sed -E 's/.*\(([^)]+)\).*/\1/')
    fi
    
    echo "$DEFAULT_DEVICE"
}

# Boot simulator
boot_simulator() {
    DEVICE_ID=$1
    echo ""
    echo "🚀 Booting iOS Simulator..."
    echo "============================"
    
    # Check if already booted
    STATE=$(xcrun simctl list devices | grep "$DEVICE_ID" | grep -oE "\(Booted\)|\(Shutdown\)")
    
    if [[ "$STATE" == *"Booted"* ]]; then
        echo -e "${GREEN}✅ Simulator already booted${NC}"
    else
        xcrun simctl boot "$DEVICE_ID" 2>/dev/null || echo -e "${YELLOW}⚠️  Simulator may already be booting${NC}"
        sleep 5
        echo -e "${GREEN}✅ Simulator booted${NC}"
    fi
    
    # Open Simulator app
    open -a Simulator
}

# Build iOS app
build_ios() {
    echo ""
    echo "🔨 Building iOS App..."
    echo "======================"
    
    cd ios
    
    # Clean build folder
    echo "Cleaning build folder..."
    xcodebuild clean -workspace SalahCompanion.xcworkspace -scheme SalahCompanion -configuration Debug 2>&1 | grep -E "error|warning|succeeded" || true
    
    # Build app
    echo "Building app..."
    xcodebuild build \
        -workspace SalahCompanion.xcworkspace \
        -scheme SalahCompanion \
        -configuration Debug \
        -sdk iphonesimulator \
        -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
        2>&1 | tee /tmp/ios-build.log | grep -E "error|warning|BUILD SUCCEEDED" || true
    
    if grep -q "BUILD SUCCEEDED" /tmp/ios-build.log; then
        echo -e "${GREEN}✅ Build succeeded${NC}"
        cd ..
        return 0
    else
        echo -e "${RED}❌ Build failed. Check /tmp/ios-build.log for details${NC}"
        cd ..
        return 1
    fi
}

# Run iOS app
run_ios() {
    DEVICE_ID=$1
    echo ""
    echo "▶️  Running iOS App..."
    echo "======================"
    
    # Start Metro bundler in background
    echo "Starting Metro bundler..."
    npm start -- --reset-cache > /tmp/metro.log 2>&1 &
    METRO_PID=$!
    sleep 5
    
    # Run app
    echo "Launching app on simulator..."
    npx react-native run-ios --simulator="$DEVICE_ID" 2>&1 | tee /tmp/ios-run.log | grep -E "error|warning|success" || true
    
    echo ""
    echo -e "${GREEN}✅ App launched${NC}"
    echo "Metro bundler PID: $METRO_PID"
    echo "To stop Metro: kill $METRO_PID"
}

# Check Hermes
check_hermes() {
    echo ""
    echo "🔍 Checking Hermes Engine..."
    echo "============================"
    
    # Check if Hermes is enabled in Podfile
    if grep -q "hermes_enabled.*true" ios/Podfile; then
        echo -e "${GREEN}✅ Hermes enabled in Podfile${NC}"
    else
        echo -e "${YELLOW}⚠️  Hermes may not be enabled${NC}"
    fi
    
    # Check if Hermes framework exists
    if [ -d "ios/Pods/hermes-engine" ]; then
        echo -e "${GREEN}✅ Hermes engine found in Pods${NC}"
    else
        echo -e "${RED}❌ Hermes engine not found${NC}"
    fi
    
    # Check for Hermes fix script
    if [ -f "ios/fix-hermes-after-build.sh" ]; then
        echo -e "${GREEN}✅ Hermes fix script found${NC}"
    else
        echo -e "${YELLOW}⚠️  Hermes fix script not found${NC}"
    fi
}

# Get app logs
get_logs() {
    echo ""
    echo "📋 Recent App Logs:"
    echo "=================="
    
    # Get logs from simulator
    xcrun simctl spawn booted log stream --predicate 'processImagePath contains "SalahCompanion"' --level debug 2>&1 | head -20 || echo "No logs available"
}

# Test app functionality
test_functionality() {
    echo ""
    echo "🧪 Testing App Functionality..."
    echo "==============================="
    echo ""
    echo "Please manually test the following:"
    echo ""
    echo "Core Features:"
    echo "  [ ] App launches successfully"
    echo "  [ ] Prayer times display"
    echo "  [ ] Azan plays (if enabled)"
    echo "  [ ] Navigation works"
    echo "  [ ] Screens load without crashes"
    echo ""
    echo "Phase 2 Features:"
    echo "  [ ] Recitation practice works"
    echo "  [ ] Pronunciation academy works"
    echo "  [ ] Achievements display"
    echo "  [ ] Audio playback works"
    echo ""
    echo "Performance:"
    echo "  [ ] App starts quickly (< 3s)"
    echo "  [ ] Screen transitions are smooth"
    echo "  [ ] No memory warnings"
    echo "  [ ] FPS stays at 60"
    echo ""
}

# Main execution
main() {
    check_xcode
    check_cocoapods
    install_pods
    list_simulators
    
    # Get device ID
    DEVICE_ID=$(get_default_simulator)
    if [ -z "$DEVICE_ID" ]; then
        echo -e "${RED}❌ No iOS simulator found${NC}"
        exit 1
    fi
    
    echo "Using device: $DEVICE_ID"
    
    check_hermes
    boot_simulator "$DEVICE_ID"
    
    # Ask user if they want to build
    echo ""
    read -p "Build and run the app? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if build_ios; then
            run_ios "$DEVICE_ID"
            sleep 10
            test_functionality
            get_logs
        else
            echo -e "${RED}❌ Build failed. Please check the errors above.${NC}"
        fi
    else
        echo "Skipping build. You can run manually with:"
        echo "  npm run ios"
        echo "  or"
        echo "  npx react-native run-ios"
    fi
    
    echo ""
    echo -e "${GREEN}✅ iOS device testing setup complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Test all features manually"
    echo "2. Check for crashes in logs"
    echo "3. Verify Hermes fix works"
    echo "4. Document findings in docs/BUG-TRACKING.md"
    echo ""
}

main "$@"

