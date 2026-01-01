#!/bin/bash

# Performance Testing Script
# Measures app performance metrics

set -e

echo "⚡ Performance Testing"
echo "======================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PACKAGE_NAME="com.salahcompanion"
RESULTS_FILE="performance-results.txt"

# Check if app is installed
check_app() {
    if ! adb shell pm list packages | grep -q "$PACKAGE_NAME"; then
        echo -e "${RED}❌ App not installed${NC}"
        echo "Install with: npm run android"
        exit 1
    fi
    echo -e "${GREEN}✅ App is installed${NC}"
}

# Measure app startup time
measure_startup() {
    echo ""
    echo "🚀 Measuring App Startup Time..."
    echo "================================"
    
    # Force stop app
    adb shell am force-stop $PACKAGE_NAME
    sleep 1
    
    # Clear logcat
    adb logcat -c
    
    # Start app and measure time
    START_TIME=$(date +%s%N)
    adb shell am start -n "$PACKAGE_NAME/.MainActivity" > /dev/null 2>&1
    
    # Wait for app to be fully loaded (check for main activity)
    TIMEOUT=10
    ELAPSED=0
    while [ $ELAPSED -lt $TIMEOUT ]; do
        if adb shell dumpsys window windows | grep -q "$PACKAGE_NAME"; then
            END_TIME=$(date +%s%N)
            DURATION=$((($END_TIME - $START_TIME) / 1000000))
            
            echo "Startup Time: ${DURATION}ms"
            
            if [ $DURATION -lt 2000 ]; then
                echo -e "${GREEN}✅ Startup time is excellent (<2s)${NC}"
            elif [ $DURATION -lt 3000 ]; then
                echo -e "${YELLOW}⚠️  Startup time is acceptable (<3s)${NC}"
            else
                echo -e "${RED}❌ Startup time is slow (>3s)${NC}"
            fi
            
            echo "startup_time_ms=$DURATION" >> $RESULTS_FILE
            return 0
        fi
        sleep 0.1
        ELAPSED=$((ELAPSED + 1))
    done
    
    echo -e "${RED}❌ App failed to start within timeout${NC}"
    return 1
}

# Measure memory usage
measure_memory() {
    echo ""
    echo "💾 Measuring Memory Usage..."
    echo "============================"
    
    sleep 2  # Wait for app to stabilize
    
    MEMORY=$(adb shell dumpsys meminfo $PACKAGE_NAME | grep "TOTAL" | head -1 | awk '{print $2}')
    if [ ! -z "$MEMORY" ]; then
        MEMORY_MB=$((MEMORY / 1024))
        echo "Memory Usage: ${MEMORY_MB}MB"
        
        if [ "$MEMORY_MB" -lt 150 ]; then
            echo -e "${GREEN}✅ Memory usage is good (<150MB)${NC}"
        elif [ "$MEMORY_MB" -lt 200 ]; then
            echo -e "${YELLOW}⚠️  Memory usage is acceptable (<200MB)${NC}"
        else
            echo -e "${RED}❌ Memory usage is high (>200MB)${NC}"
        fi
        
        echo "memory_usage_mb=$MEMORY_MB" >> $RESULTS_FILE
    fi
}

# Measure CPU usage
measure_cpu() {
    echo ""
    echo "🖥️  Measuring CPU Usage..."
    echo "========================="
    
    # Get CPU usage for the app
    CPU_USAGE=$(adb shell top -n 1 | grep $PACKAGE_NAME | awk '{print $3}' | head -1 | tr -d '%')
    
    if [ ! -z "$CPU_USAGE" ]; then
        echo "CPU Usage: ${CPU_USAGE}%"
        
        if [ $(echo "$CPU_USAGE < 10" | bc) -eq 1 ]; then
            echo -e "${GREEN}✅ CPU usage is low (<10%)${NC}"
        elif [ $(echo "$CPU_USAGE < 20" | bc) -eq 1 ]; then
            echo -e "${YELLOW}⚠️  CPU usage is moderate (<20%)${NC}"
        else
            echo -e "${RED}❌ CPU usage is high (>20%)${NC}"
        fi
        
        echo "cpu_usage_percent=$CPU_USAGE" >> $RESULTS_FILE
    else
        echo -e "${YELLOW}⚠️  Could not measure CPU usage${NC}"
    fi
}

# Check frame rate (requires app to be running)
check_frame_rate() {
    echo ""
    echo "🎬 Checking Frame Rate..."
    echo "========================="
    echo "Note: Frame rate monitoring requires the app to be running"
    echo "Use React Native Performance Monitor in the app"
    echo "Shake device → Show Perf Monitor"
    echo ""
}

# Generate report
generate_report() {
    echo ""
    echo "📊 Performance Report"
    echo "===================="
    
    if [ -f "$RESULTS_FILE" ]; then
        cat $RESULTS_FILE
        echo ""
        echo "Report saved to: $RESULTS_FILE"
    else
        echo "No performance data collected"
    fi
}

# Main execution
main() {
    # Initialize results file
    echo "# Performance Test Results" > $RESULTS_FILE
    echo "# Date: $(date)" >> $RESULTS_FILE
    echo "" >> $RESULTS_FILE
    
    check_app
    measure_startup
    measure_memory
    measure_cpu
    check_frame_rate
    generate_report
    
    echo ""
    echo -e "${GREEN}✅ Performance testing complete!${NC}"
    echo ""
    echo "For detailed profiling:"
    echo "1. Use React DevTools Profiler"
    echo "2. Use Flipper Performance Monitor"
    echo "3. Check performance-results.txt for metrics"
    echo ""
}

main "$@"

