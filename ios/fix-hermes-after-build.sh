#!/bin/bash
# Manual script to fix hermes framework after build
# Run this after a successful build to ensure framework is properly copied

set +e

# Find Pods directory (works both from Xcode and manually)
if [ -n "${PODS_ROOT}" ]; then
  PODS_DIR="${PODS_ROOT}"
elif [ -d "$(dirname "$0")/Pods" ]; then
  PODS_DIR="$(cd "$(dirname "$0")/Pods" && pwd)"
else
  PODS_DIR="$(cd "$(dirname "$0")/.." && pwd)/ios/Pods"
fi

HERMES_SOURCE="${PODS_DIR}/hermes-engine/destroot/Library/Frameworks/universal/hermes.xcframework/ios-arm64_x86_64-simulator/hermes.framework"

echo "🔧 Fixing hermes framework after build..."
echo "   PODS_DIR: ${PODS_DIR}"
echo "   HERMES_SOURCE: ${HERMES_SOURCE}"

# Find the actual build directory
ACTUAL_BUILD_DIR=$(find ~/Library/Developer/Xcode/DerivedData/SalahCompanion-*/Build/Products/Debug-iphonesimulator/SalahCompanion.app/Frameworks -maxdepth 0 -type d 2>/dev/null | head -1)

if [ -z "${ACTUAL_BUILD_DIR}" ]; then
  echo "❌ Build directory not found. Build the app first."
  exit 1
fi

FRAMEWORK_DEST="${ACTUAL_BUILD_DIR}/hermes.framework"

echo "   Destination: ${FRAMEWORK_DEST}"

if [ ! -d "${HERMES_SOURCE}" ]; then
  echo "❌ Hermes source not found at ${HERMES_SOURCE}"
  echo "   Trying alternative locations..."
  # Try alternative locations
  ALT_SOURCES=(
    "$(dirname "$0")/Pods/hermes-engine/destroot/Library/Frameworks/universal/hermes.xcframework/ios-arm64_x86_64-simulator/hermes.framework"
    "$(cd "$(dirname "$0")/.." && pwd)/ios/Pods/hermes-engine/destroot/Library/Frameworks/universal/hermes.xcframework/ios-arm64_x86_64-simulator/hermes.framework"
  )
  for alt_source in "${ALT_SOURCES[@]}"; do
    if [ -d "${alt_source}" ]; then
      HERMES_SOURCE="${alt_source}"
      echo "   ✅ Found at: ${HERMES_SOURCE}"
      break
    fi
  done
  if [ ! -d "${HERMES_SOURCE}" ]; then
    echo "❌ Hermes source not found in any location"
    exit 1
  fi
fi

# Remove any existing symlink or incomplete copy
if [ -L "${FRAMEWORK_DEST}" ] || [ -d "${FRAMEWORK_DEST}" ]; then
  echo "   Removing existing framework..."
  rm -rf "${FRAMEWORK_DEST}"
fi

# Copy framework using ditto (best for preserving metadata)
echo "   Copying framework..."
if ditto "${HERMES_SOURCE}" "${FRAMEWORK_DEST}" 2>/dev/null; then
  if [ -f "${FRAMEWORK_DEST}/Info.plist" ]; then
    echo "✅ Framework copied successfully with Info.plist"
    exit 0
  else
    echo "⚠️  Framework copied but missing Info.plist"
    exit 1
  fi
elif cp -R "${HERMES_SOURCE}" "${FRAMEWORK_DEST}" 2>/dev/null; then
  if [ -f "${FRAMEWORK_DEST}/Info.plist" ]; then
    echo "✅ Framework copied successfully (using cp) with Info.plist"
    exit 0
  else
    echo "⚠️  Framework copied but missing Info.plist"
    exit 1
  fi
else
  echo "❌ Failed to copy framework (sandbox still blocking)"
  exit 1
fi
