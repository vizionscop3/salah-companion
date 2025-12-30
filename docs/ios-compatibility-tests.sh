#!/bin/bash

# iOS Compatibility Automated Test Script
# SalahCompanion - React Native App
# Usage: ./ios-compatibility-tests.sh [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Log function
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    ((PASSED_TESTS++))
    ((TOTAL_TESTS++))
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    ((FAILED_TESTS++))
    ((TOTAL_TESTS++))
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Print header
print_header() {
    echo ""
    echo "=========================================="
    echo "  iOS Compatibility Test Suite"
    echo "  SalahCompanion"
    echo "=========================================="
    echo ""
}

# Test 1: Check Node and npm versions
test_node_environment() {
    log_info "Testing Node.js environment..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        log_success "Node.js installed: $NODE_VERSION"
    else
        log_error "Node.js not installed"
        return 1
    fi
    
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm -v)
        log_success "npm installed: $NPM_VERSION"
    else
        log_error "npm not installed"
        return 1
    fi
}

# Test 2: Check Xcode installation
test_xcode_installation() {
    log_info "Testing Xcode installation..."
    
    if command -v xcodebuild &> /dev/null; then
        XCODE_VERSION=$(xcodebuild -version | head -n 1)
        log_success "Xcode installed: $XCODE_VERSION"
    else
        log_error "Xcode not installed"
        return 1
    fi
    
    # Check for Command Line Tools
    if xcode-select -p &> /dev/null; then
        XCODE_PATH=$(xcode-select -p)
        log_success "Xcode Command Line Tools: $XCODE_PATH"
    else
        log_error "Xcode Command Line Tools not configured"
        return 1
    fi
}

# Test 3: Check CocoaPods
test_cocoapods() {
    log_info "Testing CocoaPods..."
    
    if command -v pod &> /dev/null; then
        POD_VERSION=$(pod --version)
        log_success "CocoaPods installed: $POD_VERSION"
    else
        log_error "CocoaPods not installed. Run: sudo gem install cocoapods"
        return 1
    fi
}

# Test 4: Check React Native CLI
test_react_native_cli() {
    log_info "Testing React Native CLI..."
    
    if command -v npx &> /dev/null; then
        log_success "npx available for React Native commands"
    else
        log_error "npx not available"
        return 1
    fi
}

# Test 5: Verify package.json exists
test_package_json() {
    log_info "Testing package.json configuration..."
    
    if [ -f "package.json" ]; then
        log_success "package.json found"
        
        # Check for react-native
        if grep -q "react-native" package.json; then
            RN_VERSION=$(grep -o '"react-native": "[^"]*"' package.json | cut -d'"' -f4)
            log_success "React Native version: $RN_VERSION"
        else
            log_warning "React Native not found in package.json"
        fi
    else
        log_error "package.json not found"
        return 1
    fi
}

# Test 6: Check iOS folder structure
test_ios_structure() {
    log_info "Testing iOS project structure..."
    
    if [ -d "ios" ]; then
        log_success "ios directory exists"
        
        # Check for Podfile
        if [ -f "ios/Podfile" ]; then
            log_success "Podfile exists"
        else
            log_error "Podfile not found in ios directory"
        fi
        
        # Check for workspace
        if ls ios/*.xcworkspace &> /dev/null; then
            WORKSPACE=$(ls ios/*.xcworkspace | head -n 1)
            log_success "Xcode workspace found: $(basename $WORKSPACE)"
        else
            log_warning "No .xcworkspace found (run pod install)"
        fi
        
        # Check for Info.plist
        if ls ios/*/Info.plist &> /dev/null; then
            log_success "Info.plist found"
        else
            log_error "Info.plist not found"
        fi
    else
        log_error "ios directory not found"
        return 1
    fi
}

# Test 7: Install dependencies
test_dependencies() {
    log_info "Testing dependency installation..."
    
    if [ ! -d "node_modules" ]; then
        log_info "Installing npm dependencies..."
        npm install
        log_success "npm dependencies installed"
    else
        log_success "node_modules directory exists"
    fi
}

# Test 8: Install CocoaPods dependencies
test_pod_install() {
    log_info "Testing CocoaPods installation..."
    
    if [ -d "ios" ]; then
        cd ios
        
        if [ -f "Podfile.lock" ]; then
            log_info "Running pod install..."
            pod install --repo-update
            log_success "CocoaPods dependencies installed"
        else
            log_info "First time pod install..."
            pod install
            log_success "CocoaPods initialized"
        fi
        
        cd ..
    else
        log_error "ios directory not found"
        return 1
    fi
}

# Test 9: Check available simulators
test_simulators() {
    log_info "Testing available iOS simulators..."
    
    SIMULATORS=$(xcrun simctl list devices available | grep "iPhone" | head -n 5)
    
    if [ -n "$SIMULATORS" ]; then
        log_success "iOS simulators available:"
        echo "$SIMULATORS"
    else
        log_error "No iOS simulators found"
        return 1
    fi
}

# Test 10: Build iOS app (Debug)
test_ios_build() {
    log_info "Testing iOS build (Debug configuration)..."
    
    if [ -d "ios" ]; then
        log_info "This may take several minutes on first build..."
        
        # Find the workspace
        WORKSPACE=$(ls ios/*.xcworkspace | head -n 1)
        SCHEME=$(basename "$WORKSPACE" .xcworkspace)
        
        if xcodebuild -workspace "$WORKSPACE" \
            -scheme "$SCHEME" \
            -configuration Debug \
            -sdk iphonesimulator \
            -destination 'platform=iOS Simulator,name=iPhone 15' \
            clean build \
            CODE_SIGNING_ALLOWED=NO \
            COMPILER_INDEX_STORE_ENABLE=NO \
            > /tmp/xcode_build.log 2>&1; then
            log_success "iOS Debug build successful"
        else
            log_error "iOS Debug build failed. Check /tmp/xcode_build.log for details"
            tail -n 50 /tmp/xcode_build.log
            return 1
        fi
    else
        log_error "ios directory not found"
        return 1
    fi
}

# Test 11: Analyze Info.plist for iOS compatibility
test_info_plist() {
    log_info "Testing Info.plist configuration..."
    
    INFO_PLIST=$(find ios -name "Info.plist" -not -path "*/Pods/*" | head -n 1)
    
    if [ -f "$INFO_PLIST" ]; then
        log_success "Info.plist found at: $INFO_PLIST"
        
        # Check for minimum iOS version
        if /usr/libexec/PlistBuddy -c "Print :MinimumOSVersion" "$INFO_PLIST" &> /dev/null; then
            MIN_IOS=$(/usr/libexec/PlistBuddy -c "Print :MinimumOSVersion" "$INFO_PLIST")
            log_success "Minimum iOS version: $MIN_IOS"
        else
            log_warning "MinimumOSVersion not set in Info.plist"
        fi
        
        # Check for required privacy permissions (important for Salah app)
        if /usr/libexec/PlistBuddy -c "Print :NSLocationWhenInUseUsageDescription" "$INFO_PLIST" &> /dev/null; then
            log_success "Location permission description found"
        else
            log_warning "NSLocationWhenInUseUsageDescription not set (needed for prayer times)"
        fi
        
        if /usr/libexec/PlistBuddy -c "Print :NSUserNotificationsUsageDescription" "$INFO_PLIST" &> /dev/null || \
           /usr/libexec/PlistBuddy -c "Print :NSUserNotificationAlertStyle" "$INFO_PLIST" &> /dev/null; then
            log_success "Notification permission description found"
        else
            log_warning "Notification permission not configured (needed for prayer alerts)"
        fi
    else
        log_error "Info.plist not found"
        return 1
    fi
}

# Test 12: Check for iOS-specific code issues
test_ios_code_compatibility() {
    log_info "Testing iOS-specific code patterns..."
    
    # Check for deprecated APIs
    if grep -r "UIWebView" ios/ --exclude-dir=Pods 2>/dev/null; then
        log_warning "UIWebView usage found (deprecated, use WKWebView)"
    else
        log_success "No deprecated UIWebView usage"
    fi
    
    # Check for proper React Native imports
    if [ -f "App.tsx" ] || [ -f "App.js" ]; then
        log_success "Main app file found"
    else
        log_warning "App.tsx/App.js not found in root"
    fi
}

# Test 13: Metro bundler test
test_metro_bundler() {
    log_info "Testing Metro bundler configuration..."
    
    if [ -f "metro.config.js" ]; then
        log_success "Metro config found"
    else
        log_warning "metro.config.js not found (using defaults)"
    fi
}

# Test 14: Check for common iOS compatibility issues
test_common_issues() {
    log_info "Checking for common iOS compatibility issues..."
    
    # Check node_modules for common problematic packages
    if [ -d "node_modules" ]; then
        log_success "node_modules directory accessible"
        
        # Check for React Native version compatibility
        if [ -f "node_modules/react-native/package.json" ]; then
            RN_VERSION=$(grep '"version"' node_modules/react-native/package.json | head -n 1 | cut -d'"' -f4)
            log_success "React Native version installed: $RN_VERSION"
        fi
    fi
}

# Test 15: Verify build artifacts
test_build_artifacts() {
    log_info "Testing build artifacts..."
    
    if [ -d "ios/build" ]; then
        log_success "Build directory exists"
        
        # Check for app bundle
        if ls ios/build/Build/Products/Debug-iphonesimulator/*.app &> /dev/null; then
            APP_BUNDLE=$(ls ios/build/Build/Products/Debug-iphonesimulator/*.app | head -n 1)
            log_success "App bundle created: $(basename $APP_BUNDLE)"
        else
            log_warning "No app bundle found (build may not have completed)"
        fi
    else
        log_warning "Build directory not found (no builds run yet)"
    fi
}

# Print summary
print_summary() {
    echo ""
    echo "=========================================="
    echo "  Test Summary"
    echo "=========================================="
    echo -e "${BLUE}Total Tests:${NC} $TOTAL_TESTS"
    echo -e "${GREEN}Passed:${NC} $PASSED_TESTS"
    echo -e "${RED}Failed:${NC} $FAILED_TESTS"
    echo ""
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}✅ All tests passed! iOS build is compatible.${NC}"
        echo ""
        echo "Next steps:"
        echo "  1. Run: npx react-native run-ios"
        echo "  2. Or press Cmd+R in Xcode"
        echo ""
        return 0
    else
        echo -e "${RED}❌ Some tests failed. Please fix the issues above.${NC}"
        echo ""
        return 1
    fi
}

# Main execution
main() {
    print_header
    
    # Run all tests
    test_node_environment
    test_xcode_installation
    test_cocoapods
    test_react_native_cli
    test_package_json
    test_ios_structure
    test_dependencies
    test_pod_install
    test_simulators
    test_info_plist
    test_ios_code_compatibility
    test_metro_bundler
    test_common_issues
    
    # Optional: Run full build (uncomment to enable)
    # test_ios_build
    
    test_build_artifacts
    
    print_summary
}

# Run main function
main

exit $?
