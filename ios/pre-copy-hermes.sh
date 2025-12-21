#!/bin/bash
# Pre-build script to copy hermes framework before Pods script runs
# This runs outside the sandbox context, so it might work better

set +e  # Don't exit on errors

HERMES_SOURCE="${PODS_ROOT}/hermes-engine/destroot/Library/Frameworks/universal/hermes.xcframework/ios-arm64_x86_64-simulator/hermes.framework"
FRAMEWORKS_DEST="${TARGET_BUILD_DIR}/${FRAMEWORKS_FOLDER_PATH}"

if [ -z "${FRAMEWORKS_FOLDER_PATH}" ]; then
  echo "ℹ️  FRAMEWORKS_FOLDER_PATH not set, skipping pre-copy"
  exit 0
fi

if [ ! -d "${HERMES_SOURCE}" ]; then
  echo "ℹ️  Hermes framework not found at ${HERMES_SOURCE}, skipping pre-copy"
  exit 0
fi

echo "📦 Pre-copying hermes framework to avoid sandbox issues..."
mkdir -p "${FRAMEWORKS_DEST}"

# Try multiple copy methods
if cp -R "${HERMES_SOURCE}" "${FRAMEWORKS_DEST}/" 2>/dev/null; then
  echo "✅ Successfully pre-copied hermes framework"
  exit 0
elif ditto "${HERMES_SOURCE}" "${FRAMEWORKS_DEST}/hermes.framework" 2>/dev/null; then
  echo "✅ Successfully pre-copied hermes framework (using ditto)"
  exit 0
else
  echo "⚠️  Pre-copy failed, Pods script will try to copy it"
  exit 0  # Don't fail the build
fi
