#!/bin/bash
# Install Java 17 for Android Development

echo "☕ Installing Java 17 for Android Development..."
echo ""

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew not found"
    echo "   Install Homebrew first: https://brew.sh"
    exit 1
fi

# Check if already installed
if [ -d "/opt/homebrew/opt/openjdk@17" ] || [ -d "/usr/local/opt/openjdk@17" ]; then
    echo "✅ Java 17 already installed via Homebrew"
    JAVA_PATH=$(find /opt/homebrew /usr/local -type d -name "openjdk@17" 2>/dev/null | head -1)
    echo "   Location: $JAVA_PATH"
else
    echo "📦 Installing OpenJDK 17..."
    brew install openjdk@17
    
    if [ $? -ne 0 ]; then
        echo "❌ Installation failed"
        exit 1
    fi
fi

# Determine Homebrew prefix
if [ -d "/opt/homebrew" ]; then
    BREW_PREFIX="/opt/homebrew"
else
    BREW_PREFIX="/usr/local"
fi

# Link Java
echo ""
echo "🔗 Linking Java..."
JAVA_DIR="$BREW_PREFIX/opt/openjdk@17/libexec/openjdk.jdk"
if [ -d "$JAVA_DIR" ]; then
    sudo ln -sfn "$JAVA_DIR" /Library/Java/JavaVirtualMachines/openjdk-17.jdk
    echo "✅ Java linked"
else
    echo "⚠️  Could not find Java directory at: $JAVA_DIR"
fi

# Add to shell config
SHELL_CONFIG=""
if [ -f "$HOME/.zshrc" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
elif [ -f "$HOME/.bash_profile" ]; then
    SHELL_CONFIG="$HOME/.bash_profile"
fi

if [ -n "$SHELL_CONFIG" ]; then
    echo ""
    echo "📝 Adding Java to PATH..."
    
    # Check if already configured
    if grep -q "JAVA_HOME.*17" "$SHELL_CONFIG"; then
        echo "⚠️  Java 17 already in $SHELL_CONFIG"
    else
        cat >> "$SHELL_CONFIG" << 'EOF'

# Java 17 (Added by Salah Companion setup)
export JAVA_HOME=$(/usr/libexec/java_home -v 17 2>/dev/null || echo "$HOME/Library/Java/JavaVirtualMachines/openjdk-17.jdk/Contents/Home")
export PATH="$JAVA_HOME/bin:$PATH"
EOF
        echo "✅ Added to $SHELL_CONFIG"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Java 17 installation complete!"
echo ""
echo "🔄 Next steps:"
echo "  1. Reload shell: source $SHELL_CONFIG"
echo "  2. Verify: java -version"
echo "  3. Should show: openjdk version \"17.x.x\""
echo ""

