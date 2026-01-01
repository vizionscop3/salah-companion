#!/bin/bash

# Setup Script for Spark-TTS Arabic Model
# This script sets up the Spark-TTS environment for generating Arabic audio files

set -e

echo "🎙️  Setting up Spark-TTS for Arabic Audio Generation"
echo "=================================================="
echo ""

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "   Please install Python 3.8 or higher"
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"
echo ""

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is required but not installed."
    echo "   Please install pip3"
    exit 1
fi

echo "✅ pip3 found"
echo ""

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "📁 Project root: $PROJECT_ROOT"
echo ""

# Clone Spark-TTS if not already cloned
SPARK_TTS_DIR="$PROJECT_ROOT/Spark-TTS"
if [ ! -d "$SPARK_TTS_DIR" ]; then
    echo "📥 Cloning Spark-TTS repository..."
    git clone https://github.com/SparkAudio/Spark-TTS.git
    echo "✅ Spark-TTS cloned"
else
    echo "✅ Spark-TTS already cloned"
fi

echo ""

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install transformers soundfile huggingface_hub omegaconf torch

echo ""
echo "✅ Dependencies installed"
echo ""

# Create models directory
MODELS_DIR="$PROJECT_ROOT/models"
mkdir -p "$MODELS_DIR"
echo "✅ Models directory created: $MODELS_DIR"
echo ""

# Create assets/audio directory structure
ASSETS_AUDIO_DIR="$PROJECT_ROOT/assets/audio"
mkdir -p "$ASSETS_AUDIO_DIR/quran"
mkdir -p "$ASSETS_AUDIO_DIR/prayers"
mkdir -p "$ASSETS_AUDIO_DIR/azan"
mkdir -p "$ASSETS_AUDIO_DIR/letters"
echo "✅ Audio directories created: $ASSETS_AUDIO_DIR"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Review the Spark-TTS documentation: $SPARK_TTS_DIR/README.md"
echo "   2. Test audio generation: python3 scripts/generate-arabic-audio.py"
echo "   3. Generate audio files for your content"
echo ""
echo "💡 Note: The actual audio generation requires implementing the Spark-TTS"
echo "   inference pipeline. See docs/ARABIC_TTS_INTEGRATION.md for details."

