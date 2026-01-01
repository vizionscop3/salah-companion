#!/bin/bash
# Post-build script to convert symlinked frameworks to real copies
# This runs after build completes, so sandbox might be less restrictive

set +e  # Don't exit on errors

FRAMEWORKS_DIR="${TARGET_BUILD_DIR}/${FRAMEWORKS_FOLDER_PATH}"

echo "🔧 Post-build: Starting symlink fix script..."
echo "   FRAMEWORKS_FOLDER_PATH: ${FRAMEWORKS_FOLDER_PATH}"
echo "   TARGET_BUILD_DIR: ${TARGET_BUILD_DIR}"
echo "   FRAMEWORKS_DIR: ${FRAMEWORKS_DIR}"

if [ -z "${FRAMEWORKS_FOLDER_PATH}" ]; then
  echo "⚠️  FRAMEWORKS_FOLDER_PATH not set, skipping"
  exit 0
fi

if [ ! -d "${FRAMEWORKS_DIR}" ]; then
  echo "⚠️  Frameworks directory does not exist: ${FRAMEWORKS_DIR}"
  exit 0
fi

echo "🔧 Post-build: Checking for symlinked frameworks in ${FRAMEWORKS_DIR}..."

# Find all symlinks in frameworks directory (including broken ones)
find "${FRAMEWORKS_DIR}" -type l | while read symlink_path; do
  if [ -L "${symlink_path}" ]; then
    echo "⚠️  Found symlink: ${symlink_path}"
    
    # Check if symlink is broken
    if [ ! -e "${symlink_path}" ]; then
      echo "   ❌ Symlink is broken (target doesn't exist)"
      # Try to resolve the actual target
      real_source=$(readlink "${symlink_path}" 2>/dev/null || echo "")
      echo "   Symlink points to: ${real_source}"
      
      # Try to find the actual framework source
      if [[ "${symlink_path}" == *"hermes.framework"* ]]; then
        # Look for hermes framework in common locations
        possible_sources=(
          "${PODS_ROOT}/hermes-engine/destroot/Library/Frameworks/universal/hermes.xcframework/ios-arm64_x86_64-simulator/hermes.framework"
          "${PODS_ROOT}/../node_modules/react-native/ios/Pods/hermes-engine/destroot/Library/Frameworks/universal/hermes.xcframework/ios-arm64_x86_64-simulator/hermes.framework"
        )
        
        for possible_source in "${possible_sources[@]}"; do
          if [ -d "${possible_source}" ] && [ -f "${possible_source}/Info.plist" ]; then
            echo "   ✅ Found valid source at: ${possible_source}"
            real_source="${possible_source}"
            break
          fi
        done
      fi
    else
      real_source=$(readlink -f "${symlink_path}" 2>/dev/null || readlink "${symlink_path}")
    fi
    
    if [ -d "${real_source}" ] && [ -f "${real_source}/Info.plist" ]; then
      echo "   Attempting to convert symlink to real copy..."
      framework_name=$(basename "${symlink_path}")
      parent_dir=$(dirname "${symlink_path}")
      temp_dir="${parent_dir}/.${framework_name}.tmp"
      
      # Try to copy to temp location first - use ditto which preserves all metadata including Info.plist
      if ditto "${real_source}" "${temp_dir}" 2>/dev/null; then
        # Verify Info.plist exists in the copy
        if [ -f "${temp_dir}/Info.plist" ]; then
          # Remove symlink and move temp to final location
          rm -f "${symlink_path}"
          if mv "${temp_dir}" "${symlink_path}" 2>/dev/null; then
            echo "   ✅ Successfully converted symlink to real copy (with Info.plist)"
          else
            echo "   ⚠️  Failed to move copy, restoring symlink"
            rm -rf "${temp_dir}"
            ln -sf "${real_source}" "${symlink_path}"
          fi
        else
          echo "   ⚠️  Copy missing Info.plist, trying cp -R instead..."
          rm -rf "${temp_dir}"
          if cp -R "${real_source}" "${temp_dir}" 2>/dev/null && [ -f "${temp_dir}/Info.plist" ]; then
            rm -f "${symlink_path}"
            mv "${temp_dir}" "${symlink_path}" 2>/dev/null && {
              echo "   ✅ Successfully converted symlink to real copy (with Info.plist via cp)"
            } || {
              rm -rf "${temp_dir}"
              ln -sf "${real_source}" "${symlink_path}"
            }
          else
            echo "   ⚠️  Could not copy framework with Info.plist (sandbox blocking)."
            rm -rf "${temp_dir}"
          fi
        fi
      elif cp -R "${real_source}" "${temp_dir}" 2>/dev/null && [ -f "${temp_dir}/Info.plist" ]; then
        # Fallback to cp -R
        rm -f "${symlink_path}"
        mv "${temp_dir}" "${symlink_path}" 2>/dev/null && {
          echo "   ✅ Successfully converted symlink to real copy (with Info.plist via cp -R)"
        } || {
          rm -rf "${temp_dir}"
          ln -sf "${real_source}" "${symlink_path}"
        }
      else
      echo "   ⚠️  Could not copy framework (sandbox still blocking)."
      echo "   Removing broken symlink to prevent installation failure..."
      rm -f "${symlink_path}"
      echo "   ⚠️  Framework removed. App may fail at runtime if framework is required."
      rm -rf "${temp_dir}"
      fi
    else
      echo "   ❌ Source not found or invalid: ${real_source}"
      echo "   Removing broken symlink to prevent installation failure..."
      rm -f "${symlink_path}"
      echo "   ⚠️  Broken symlink removed. App may fail at runtime."
    fi
  fi
done

# Also check for any remaining symlinks and remove broken ones
echo "🔧 Post-build: Final check for broken symlinks..."
find "${FRAMEWORKS_DIR}" -type l | while read symlink_path; do
  if [ -L "${symlink_path}" ] && [ ! -e "${symlink_path}" ]; then
    echo "⚠️  Removing broken symlink: ${symlink_path}"
    rm -f "${symlink_path}"
  fi
done

echo "✅ Post-build: Symlink fix script completed"
exit 0
