#!/bin/bash

# Font Setup Script for Salah Companion
# Downloads Poppins and Inter fonts from Google Fonts

set -e

FONTS_DIR="./assets/fonts"
GOOGLE_FONTS_API="https://fonts.googleapis.com/css2"

echo "🎨 Setting up fonts for Salah Companion..."

# Create fonts directory if it doesn't exist
mkdir -p "$FONTS_DIR"

# Function to download font from Google Fonts
download_font() {
  local font_family=$1
  local weights=$2
  
  echo "📥 Downloading $font_family..."
  
  # Get CSS file
  local css_url="${GOOGLE_FONTS_API}?family=${font_family}:wght@${weights}&display=swap"
  local css_file=$(curl -s "$css_url")
  
  # Extract font URLs and download
  echo "$css_file" | grep -oP 'url\(https://[^)]+\.woff2\)' | sed 's/url(\(.*\))/\1/' | while read url; do
    filename=$(basename "$url" | cut -d'?' -f1)
    weight=$(echo "$filename" | grep -oP 'wght@\K[0-9]+' || echo "400")
    style=$(echo "$filename" | grep -oP 'ital@\K[0-9]+' || echo "0")
    
    # Convert to TTF filename format
    if [ "$style" = "1" ]; then
      ttf_name="${font_family}-Italic-${weight}.ttf"
    else
      ttf_name="${font_family}-Regular-${weight}.ttf"
    fi
    
    # Map weights to standard names
    case $weight in
      400) ttf_name="${font_family}-Regular.ttf" ;;
      500) ttf_name="${font_family}-Medium.ttf" ;;
      600) ttf_name="${font_family}-SemiBold.ttf" ;;
      700) ttf_name="${font_family}-Bold.ttf" ;;
      800) ttf_name="${font_family}-ExtraBold.ttf" ;;
      900) ttf_name="${font_family}-Black.ttf" ;;
    esac
    
    echo "  Downloading $ttf_name..."
    curl -L "$url" -o "$FONTS_DIR/$ttf_name" || echo "  ⚠️  Failed to download $ttf_name"
  done
}

# Download Poppins (weights: 400, 500, 600, 700, 800)
download_font "Poppins" "400;500;600;700;800"

# Download Inter (weights: 400, 500, 600)
download_font "Inter" "400;500;600"

echo ""
echo "✅ Font setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Run 'npx react-native-asset' to link fonts (if needed)"
echo "2. For iOS: Add fonts to Info.plist"
echo "3. For Android: Fonts should work automatically"
echo ""
echo "📚 Font files are in: $FONTS_DIR"

