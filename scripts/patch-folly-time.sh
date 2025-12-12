#!/bin/bash
# Patch RCT-Folly Time.h to fix clockid_t typedef redefinition error
# This script patches the actual source file (not the symlink)

cd "$(dirname "$0")/.." || exit 1

FOLLY_TIME_H="ios/Pods/RCT-Folly/folly/portability/Time.h"

if [ ! -f "$FOLLY_TIME_H" ]; then
  echo "❌ File not found: $FOLLY_TIME_H"
  echo "   Run 'cd ios && pod install' first"
  exit 1
fi

# Check if already patched
if grep -q "#ifndef clockid_t" "$FOLLY_TIME_H"; then
  echo "✅ Time.h already patched"
  exit 0
fi

# Patch the file
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' 's/typedef uint8_t clockid_t;/#ifndef clockid_t\
typedef uint8_t clockid_t;\
#endif/' "$FOLLY_TIME_H"
else
  # Linux
  sed -i 's/typedef uint8_t clockid_t;/#ifndef clockid_t\
typedef uint8_t clockid_t;\
#endif/' "$FOLLY_TIME_H"
fi

if grep -q "#ifndef clockid_t" "$FOLLY_TIME_H"; then
  echo "✅ Successfully patched Time.h"
else
  echo "❌ Failed to patch Time.h"
  exit 1
fi

