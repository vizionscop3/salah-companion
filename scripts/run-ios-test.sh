#!/bin/bash
# Script to run a specific test on iOS simulator
# Usage: ./scripts/run-ios-test.sh [test-name]
# Example: ./scripts/run-ios-test.sh QiblaCompass

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

TEST_NAME="${1:-}"

if [ -z "$TEST_NAME" ]; then
    echo "📋 Available tests:"
    echo ""
    echo "Unit Tests:"
    find tests/unit -name "*.test.ts" -o -name "*.test.tsx" | sed 's|tests/unit/||' | sed 's|\.test\.tsx\?||' | sort
    echo ""
    echo "Integration Tests:"
    find tests/integration -name "*.test.ts" | sed 's|tests/integration/||' | sed 's|\.test\.ts||' | sort
    echo ""
    echo "E2E Tests:"
    find tests/e2e -name "*.test.ts" | sed 's|tests/e2e/||' | sed 's|\.test\.ts||' | sort
    echo ""
    echo "Usage: ./scripts/run-ios-test.sh [test-name]"
    echo "Example: ./scripts/run-ios-test.sh QiblaCompass"
    exit 1
fi

echo "🧪 Running test: $TEST_NAME"
echo "============================"

# Find the test file
TEST_FILE=$(find tests -name "*${TEST_NAME}*.test.ts" -o -name "*${TEST_NAME}*.test.tsx" | head -1)

if [ -z "$TEST_FILE" ]; then
    echo "❌ Test file not found for: $TEST_NAME"
    echo "Available tests:"
    find tests -name "*.test.ts" -o -name "*.test.tsx" | sed 's|tests/||'
    exit 1
fi

echo "📁 Test file: $TEST_FILE"
echo ""

# Run the test
npm test -- "$TEST_FILE" --verbose

echo ""
echo "✅ Test completed"

