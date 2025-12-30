#!/bin/bash
# Post-embed script to fix hermes framework after build
# This runs AFTER framework embedding to ensure Hermes is properly copied
# Works around sandbox issues that prevent framework copying during build

set +e  # Don't fail the build if this script has issues

# Find Pods directory (works both from Xcode and manually)
if [ -n "${PODS_ROOT}" ]; then
  PODS_DIR="${PODS_ROOT}"
elif [ -d "$(dirname "$0")/Pods" ]; then
  PODS_DIR="$(cd "$(dirname "$0")/Pods" && pwd)"
else
  PODS_DIR="$(cd "$(dirname "$0")/.." && pwd)/ios/Pods"
fi

# Determine simulator vs device architecture
if [ "${PLATFORM_NAME}" = "iphonesimulator" ]; then
  HERMES_ARCH="ios-arm64_x86_64-simulator"
elif [ "${PLATFORM_NAME}" = "iphoneos" ]; then
  HERMES_ARCH="ios-arm64"
else
  HERMES_ARCH="ios-arm64_x86_64-simulator"  # Default to simulator
fi

HERMES_SOURCE="${PODS_DIR}/hermes-engine/destroot/Library/Frameworks/universal/hermes.xcframework/${HERMES_ARCH}/hermes.framework"

echo "🔧 Fixing hermes framework after build..."
echo "   PODS_DIR: ${PODS_DIR}"
echo "   PLATFORM_NAME: ${PLATFORM_NAME}"
echo "   HERMES_ARCH: ${HERMES_ARCH}"
echo "   HERMES_SOURCE: ${HERMES_SOURCE}"

# Find the actual build directory - try multiple locations
ACTUAL_BUILD_DIR=""

# Try using Xcode build variables first
if [ -n "${TARGET_BUILD_DIR}" ] && [ -n "${FRAMEWORKS_FOLDER_PATH}" ]; then
  ACTUAL_BUILD_DIR="${TARGET_BUILD_DIR}/${FRAMEWORKS_FOLDER_PATH}"
  if [ ! -d "${ACTUAL_BUILD_DIR}" ]; then
    ACTUAL_BUILD_DIR=""
  fi
fi

# Fallback: search DerivedData
if [ -z "${ACTUAL_BUILD_DIR}" ]; then
  ACTUAL_BUILD_DIR=$(find ~/Library/Developer/Xcode/DerivedData/SalahCompanion-*/Build/Products/Debug-iphonesimulator/SalahCompanion.app/Frameworks -maxdepth 0 -type d 2>/dev/null | head -1)
fi

# Another fallback: try Release build
if [ -z "${ACTUAL_BUILD_DIR}" ]; then
  ACTUAL_BUILD_DIR=$(find ~/Library/Developer/Xcode/DerivedData/SalahCompanion-*/Build/Products/Release-iphonesimulator/SalahCompanion.app/Frameworks -maxdepth 0 -type d 2>/dev/null | head -1)
fi

# Last fallback: try any build
if [ -z "${ACTUAL_BUILD_DIR}" ]; then
  ACTUAL_BUILD_DIR=$(find ~/Library/Developer/Xcode/DerivedData/SalahCompanion-*/Build/Products/*-iphonesimulator/SalahCompanion.app/Frameworks -maxdepth 0 -type d 2>/dev/null | head -1)
fi

if [ -z "${ACTUAL_BUILD_DIR}" ]; then
  echo "⚠️  Build directory not found. This is OK if running outside Xcode build."
  echo "   Will try to create it if needed..."
  # Try to create it based on common paths
  if [ -n "${TARGET_BUILD_DIR}" ] && [ -n "${FRAMEWORKS_FOLDER_PATH}" ]; then
    ACTUAL_BUILD_DIR="${TARGET_BUILD_DIR}/${FRAMEWORKS_FOLDER_PATH}"
    mkdir -p "${ACTUAL_BUILD_DIR}" 2>/dev/null || true
  fi
fi

if [ -z "${ACTUAL_BUILD_DIR}" ] || [ ! -d "${ACTUAL_BUILD_DIR}" ]; then
  echo "⚠️  Cannot determine build directory - framework may already be embedded"
  echo "   TARGET_BUILD_DIR: ${TARGET_BUILD_DIR}"
  echo "   FRAMEWORKS_FOLDER_PATH: ${FRAMEWORKS_FOLDER_PATH}"
  exit 0  # Don't fail the build - framework might already be there
fi

FRAMEWORK_DEST="${ACTUAL_BUILD_DIR}/hermes.framework"

echo "   Destination: ${FRAMEWORK_DEST}"

# Check if framework already exists and is valid
if [ -d "${FRAMEWORK_DEST}" ] && [ -f "${FRAMEWORK_DEST}/hermes" ] && [ -f "${FRAMEWORK_DEST}/Info.plist" ]; then
  echo "✅ Hermes framework already exists and is valid"
  exit 0
fi

# Check if it's a symlink (needs to be replaced)
if [ -L "${FRAMEWORK_DEST}" ]; then
  echo "   Removing symlink..."
  rm -f "${FRAMEWORK_DEST}"
fi

if [ ! -d "${HERMES_SOURCE}" ]; then
  echo "❌ Hermes source not found at ${HERMES_SOURCE}"
  echo "   Trying alternative locations..."
  # Try alternative locations
  ALT_SOURCES=(
    "${PODS_DIR}/hermes-engine/destroot/Library/Frameworks/universal/hermes.xcframework/ios-arm64_x86_64-simulator/hermes.framework"
    "${PODS_DIR}/hermes-engine/destroot/Library/Frameworks/universal/hermes.xcframework/ios-arm64/hermes.framework"
    "$(dirname "$0")/Pods/hermes-engine/destroot/Library/Frameworks/universal/hermes.xcframework/${HERMES_ARCH}/hermes.framework"
    "$(cd "$(dirname "$0")/.." && pwd)/ios/Pods/hermes-engine/destroot/Library/Frameworks/universal/hermes.xcframework/${HERMES_ARCH}/hermes.framework"
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
    echo "   This is non-fatal - Pods script should have copied it"
    exit 0  # Don't fail the build
  fi
fi

# Remove any existing incomplete copy
if [ -d "${FRAMEWORK_DEST}" ]; then
  echo "   Removing existing incomplete framework..."
  rm -rf "${FRAMEWORK_DEST}"
fi

# Copy framework using ditto (best for preserving metadata)
echo "   Copying framework..."
if ditto "${HERMES_SOURCE}" "${FRAMEWORK_DEST}" 2>/dev/null; then
  if [ -f "${FRAMEWORK_DEST}/Info.plist" ] && [ -f "${FRAMEWORK_DEST}/hermes" ]; then
    echo "✅ Framework copied successfully with Info.plist and binary"
    exit 0
  else
    echo "⚠️  Framework copied but missing files"
    exit 0  # Don't fail - might still work
  fi
elif cp -R "${HERMES_SOURCE}" "${FRAMEWORK_DEST}" 2>/dev/null; then
  if [ -f "${FRAMEWORK_DEST}/Info.plist" ] && [ -f "${FRAMEWORK_DEST}/hermes" ]; then
    echo "✅ Framework copied successfully (using cp) with Info.plist and binary"
    exit 0
  else
    echo "⚠️  Framework copied but missing files"
    exit 0  # Don't fail - might still work
  fi
else
  echo "⚠️  Failed to copy framework - Pods script should have handled this"
  echo "   This is non-fatal - build will continue"
  exit 0  # Don't fail the build
fi
