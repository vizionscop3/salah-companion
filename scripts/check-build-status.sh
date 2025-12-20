#!/bin/bash
# Quick Build Status Check

echo "🔍 Checking Build Status..."
echo ""

# Check Gradle download
echo "📦 Gradle 7.6.3 Status:"
if [ -d ~/.gradle/wrapper/dists/gradle-7.6.3-bin ]; then
    GRADLE_DIR=$(find ~/.gradle/wrapper/dists/gradle-7.6.3-bin -type d -mindepth 1 -maxdepth 1 | head -1)
    if [ -f "$GRADLE_DIR/gradle-7.6.3-bin.zip" ]; then
        echo "  ✅ Gradle downloaded"
        ls -lh "$GRADLE_DIR/gradle-7.6.3-bin.zip" 2>/dev/null | awk '{print "  Size: " $5}'
    else
        echo "  ⏳ Gradle downloading..."
        if [ -d "$GRADLE_DIR" ]; then
            echo "  Progress: $(du -sh "$GRADLE_DIR" 2>/dev/null | awk '{print $1}')"
        fi
    fi
else
    echo "  ⚠️  Gradle directory not found"
fi

echo ""
echo "📱 Emulator Status:"
adb devices | grep "emulator" && echo "  ✅ Emulator connected" || echo "  ⚠️  No emulator found"

echo ""
echo "🔨 Build Process:"
if pgrep -f "gradle" > /dev/null; then
    echo "  ✅ Gradle process running"
    echo "  PID: $(pgrep -f "gradle" | head -1)"
elif pgrep -f "react-native" > /dev/null; then
    echo "  ✅ React Native process running"
else
    echo "  ⚠️  No build process detected"
fi

echo ""
echo "📊 Next Steps:"
echo "  1. If Gradle is downloading, wait for it to complete"
echo "  2. Check your terminal for build progress"
echo "  3. Look for 'BUILD SUCCESSFUL' message"
echo "  4. App should launch automatically on emulator"

