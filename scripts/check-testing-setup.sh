#!/bin/bash
# Check Testing Setup Script
# Verifies all requirements for device testing

echo "🔍 Checking Testing Setup..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "Node.js: "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} $NODE_VERSION"
else
    echo -e "${RED}✗ Not found${NC}"
    exit 1
fi

# Check npm
echo -n "npm: "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} $NPM_VERSION"
else
    echo -e "${RED}✗ Not found${NC}"
    exit 1
fi

# Check React Native CLI
echo -n "React Native CLI: "
if command -v react-native &> /dev/null; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${YELLOW}⚠${NC} Not in PATH (using npx is fine)"
fi

# Check Android SDK
echo -n "Android SDK: "
if [ -n "$ANDROID_HOME" ]; then
    echo -e "${GREEN}✓${NC} $ANDROID_HOME"
else
    echo -e "${YELLOW}⚠${NC} ANDROID_HOME not set"
    echo "   Add to ~/.zshrc: export ANDROID_HOME=\$HOME/Library/Android/sdk"
fi

# Check adb
echo -n "adb: "
if command -v adb &> /dev/null; then
    ADB_VERSION=$(adb version | head -1)
    echo -e "${GREEN}✓${NC} $ADB_VERSION"
else
    echo -e "${YELLOW}⚠${NC} Not in PATH"
    echo "   Add to PATH: \$ANDROID_HOME/platform-tools"
fi

# Check connected devices
echo ""
echo -n "Connected Devices: "
if command -v adb &> /dev/null; then
    DEVICES=$(adb devices | grep -v "List" | grep "device" | wc -l | tr -d ' ')
    if [ "$DEVICES" -gt 0 ]; then
        echo -e "${GREEN}✓${NC} $DEVICES device(s)"
        adb devices | grep "device"
    else
        echo -e "${YELLOW}⚠${NC} No devices connected"
        echo "   Start emulator or connect physical device"
    fi
else
    echo -e "${YELLOW}⚠${NC} Cannot check (adb not found)"
fi

# Check emulator
echo -n "Android Emulator: "
if command -v emulator &> /dev/null; then
    echo -e "${GREEN}✓${NC} Available"
    echo "   Available AVDs:"
    emulator -list-avds 2>/dev/null | sed 's/^/     - /' || echo "     (none)"
else
    echo -e "${YELLOW}⚠${NC} Not in PATH"
    echo "   Add to PATH: \$ANDROID_HOME/emulator"
fi

# Check project dependencies
echo ""
echo "Project Dependencies:"
if [ -d "node_modules" ]; then
    echo -e "  ${GREEN}✓${NC} node_modules exists"
else
    echo -e "  ${RED}✗${NC} node_modules missing"
    echo "     Run: npm install"
fi

# Check Jest
echo -n "Jest: "
if [ -f "node_modules/.bin/jest" ]; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${RED}✗${NC} Not installed"
fi

# Check TypeScript
echo -n "TypeScript: "
if [ -f "node_modules/.bin/tsc" ]; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${RED}✗${NC} Not installed"
fi

# Check Android build files
echo ""
echo "Android Build:"
if [ -d "android" ]; then
    echo -e "  ${GREEN}✓${NC} android/ directory exists"
    if [ -f "android/build.gradle" ]; then
        echo -e "  ${GREEN}✓${NC} build.gradle exists"
    else
        echo -e "  ${RED}✗${NC} build.gradle missing"
    fi
else
    echo -e "  ${RED}✗${NC} android/ directory missing"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Setup Check Complete!"
echo ""
echo "Next steps:"
echo "  1. Fix any issues marked with ✗"
echo "  2. Review warnings marked with ⚠"
echo "  3. Run: npm test (for unit tests)"
echo "  4. Run: npm run android (for device testing)"
echo ""

