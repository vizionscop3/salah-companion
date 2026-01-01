#!/bin/bash

# Device Testing Script
# Automates device testing setup and verification

set -e

echo "🔍 Device Testing Setup"
echo "======================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if adb is available
check_adb() {
    if ! command -v adb &> /dev/null; then
        echo -e "${RED}❌ adb not found. Please install Android SDK.${NC}"
        echo "Run: npm run test:setup:android"
        exit 1
    fi
    echo -e "${GREEN}✅ adb found${NC}"
}

# Check if device is connected
check_device() {
    echo "Checking for connected devices..."
    DEVICES=$(adb devices | grep -v "List" | grep "device$" | wc -l | tr -d ' ')
    
    if [ "$DEVICES" -eq 0 ]; then
        echo -e "${YELLOW}⚠️  No devices found${NC}"
        echo "Please connect a device or start an emulator"
        echo ""
        echo "To start emulator:"
        echo "  emulator -avd <emulator_name> &"
        echo ""
        echo "To check devices:"
        echo "  adb devices"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Found $DEVICES device(s)${NC}"
    adb devices
}

# Get device info
get_device_info() {
    echo ""
    echo "📱 Device Information:"
    echo "====================="
    
    MODEL=$(adb shell getprop ro.product.model 2>/dev/null | tr -d '\r')
    VERSION=$(adb shell getprop ro.build.version.release 2>/dev/null | tr -d '\r')
    SDK=$(adb shell getprop ro.build.version.sdk 2>/dev/null | tr -d '\r')
    MANUFACTURER=$(adb shell getprop ro.product.manufacturer 2>/dev/null | tr -d '\r')
    
    echo "Model: $MODEL"
    echo "Manufacturer: $MANUFACTURER"
    echo "Android Version: $VERSION"
    echo "SDK Level: $SDK"
    echo ""
}

# Check app installation
check_app_installed() {
    PACKAGE_NAME="com.salahcompanion"
    
    echo "Checking if app is installed..."
    if adb shell pm list packages | grep -q "$PACKAGE_NAME"; then
        echo -e "${GREEN}✅ App is installed${NC}"
        
        # Get app version
        VERSION=$(adb shell dumpsys package $PACKAGE_NAME | grep versionName | head -1 | cut -d'=' -f2 | tr -d '\r')
        echo "App Version: $VERSION"
    else
        echo -e "${YELLOW}⚠️  App not installed${NC}"
        echo "Install with: npm run android"
    fi
    echo ""
}

# Run basic functionality tests
run_basic_tests() {
    echo "🧪 Running Basic Functionality Tests"
    echo "===================================="
    
    PACKAGE_NAME="com.salahcompanion"
    
    # Test 1: App can launch
    echo "Test 1: App Launch..."
    adb shell am start -n "$PACKAGE_NAME/.MainActivity" > /dev/null 2>&1
    sleep 3
    
    if adb shell dumpsys window windows | grep -q "$PACKAGE_NAME"; then
        echo -e "${GREEN}✅ App launched successfully${NC}"
    else
        echo -e "${RED}❌ App failed to launch${NC}"
    fi
    
    # Test 2: Check for crashes
    echo "Test 2: Checking for crashes..."
    sleep 2
    CRASHES=$(adb logcat -d | grep -i "fatal\|crash\|exception" | wc -l | tr -d ' ')
    if [ "$CRASHES" -eq 0 ]; then
        echo -e "${GREEN}✅ No crashes detected${NC}"
    else
        echo -e "${YELLOW}⚠️  Found $CRASHES potential crash logs${NC}"
    fi
    
    echo ""
}

# Check memory usage
check_memory() {
    echo "💾 Memory Usage:"
    echo "==============="
    
    PACKAGE_NAME="com.salahcompanion"
    
    if adb shell pm list packages | grep -q "$PACKAGE_NAME"; then
        MEMORY=$(adb shell dumpsys meminfo $PACKAGE_NAME | grep "TOTAL" | head -1 | awk '{print $2}')
        if [ ! -z "$MEMORY" ]; then
            MEMORY_MB=$((MEMORY / 1024))
            echo "Memory Usage: ${MEMORY_MB}MB"
            
            if [ "$MEMORY_MB" -lt 150 ]; then
                echo -e "${GREEN}✅ Memory usage is acceptable (<150MB)${NC}"
            else
                echo -e "${YELLOW}⚠️  Memory usage is high (>150MB)${NC}"
            fi
        fi
    fi
    echo ""
}

# Check logcat for errors
check_logs() {
    echo "📋 Recent Logs (last 20 lines):"
    echo "==============================="
    adb logcat -d -t 20 | tail -20
    echo ""
}

# Main execution
main() {
    echo ""
    check_adb
    check_device
    get_device_info
    check_app_installed
    run_basic_tests
    check_memory
    check_logs
    
    echo -e "${GREEN}✅ Device testing setup complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run manual tests using the checklist in docs/DEVICE-TESTING-CHECKLIST.md"
    echo "2. Test all features on the device"
    echo "3. Document any issues found"
    echo ""
}

main "$@"

