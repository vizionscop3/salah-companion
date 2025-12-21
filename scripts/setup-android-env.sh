#!/bin/bash
# Setup Android Environment Variables
# Adds Android SDK to PATH

SHELL_CONFIG=""
if [ -f "$HOME/.zshrc" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
elif [ -f "$HOME/.bash_profile" ]; then
    SHELL_CONFIG="$HOME/.bash_profile"
elif [ -f "$HOME/.bashrc" ]; then
    SHELL_CONFIG="$HOME/.bashrc"
fi

if [ -z "$SHELL_CONFIG" ]; then
    echo "❌ Could not find shell config file"
    exit 1
fi

echo "📝 Setting up Android environment variables..."
echo "   Config file: $SHELL_CONFIG"

# Check if already configured
if grep -q "ANDROID_HOME" "$SHELL_CONFIG"; then
    echo "⚠️  Android environment already configured"
    echo "   Current configuration:"
    grep "ANDROID_HOME" "$SHELL_CONFIG" | head -5
    read -p "   Overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "   Skipped"
        exit 0
    fi
    # Remove old configuration
    sed -i.bak '/ANDROID_HOME/d' "$SHELL_CONFIG"
    sed -i.bak '/android\/sdk/d' "$SHELL_CONFIG"
fi

# Default Android SDK location (macOS)
ANDROID_SDK="$HOME/Library/Android/sdk"

# Check if SDK exists
if [ ! -d "$ANDROID_SDK" ]; then
    echo "⚠️  Android SDK not found at: $ANDROID_SDK"
    read -p "   Enter Android SDK path (or press Enter to use default): " CUSTOM_SDK
    if [ -n "$CUSTOM_SDK" ] && [ -d "$CUSTOM_SDK" ]; then
        ANDROID_SDK="$CUSTOM_SDK"
    else
        echo "   Please install Android Studio first"
        echo "   Download: https://developer.android.com/studio"
        exit 1
    fi
fi

# Add to shell config
cat >> "$SHELL_CONFIG" << EOF

# Android SDK (Added by Salah Companion setup)
export ANDROID_HOME=$ANDROID_SDK
export PATH=\$PATH:\$ANDROID_HOME/emulator
export PATH=\$PATH:\$ANDROID_HOME/platform-tools
export PATH=\$PATH:\$ANDROID_HOME/tools
export PATH=\$PATH:\$ANDROID_HOME/tools/bin
EOF

echo "✅ Android environment variables added"
echo ""
echo "📋 Added to $SHELL_CONFIG:"
echo "   export ANDROID_HOME=$ANDROID_SDK"
echo "   export PATH=\$PATH:\$ANDROID_HOME/emulator"
echo "   export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
echo "   export PATH=\$PATH:\$ANDROID_HOME/tools"
echo "   export PATH=\$PATH:\$ANDROID_HOME/tools/bin"
echo ""
echo "🔄 Reload your shell configuration:"
echo "   source $SHELL_CONFIG"
echo ""
echo "   Or open a new terminal window"
echo ""
echo "✅ Setup complete!"

