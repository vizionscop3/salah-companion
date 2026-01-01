# Performance Testing Guide

**Date**: December 22, 2024  
**Status**: 🟢 Ready for Use

---

## 📊 Performance Targets

### App Startup
- **Target**: < 2 seconds
- **Acceptable**: < 3 seconds
- **Measurement**: Time from app launch to first interactive screen

### Screen Transitions
- **Target**: < 300ms
- **Acceptable**: < 500ms
- **Measurement**: Time from navigation trigger to screen render

### API Calls
- **Prayer Time Calculation**: < 100ms
- **Quran Text Fetch**: < 2 seconds
- **Audio Download**: < 5 seconds

### Memory Usage
- **Target**: < 150MB
- **Acceptable**: < 200MB
- **Measurement**: Peak memory usage during normal operation

### CPU Usage
- **Target**: < 10% (idle)
- **Acceptable**: < 20% (active)
- **Measurement**: Average CPU usage

---

## 🛠️ Performance Testing Tools

### 1. Built-in Performance Monitor

The app includes a built-in performance monitor (`src/utils/performanceMonitor.ts`):

```typescript
import {performanceMonitor} from '@utils/performanceMonitor';

// Measure async operation
await performanceMonitor.measure('api_call', async () => {
  await fetchData();
});

// Measure sync operation
performanceMonitor.measureSync('calculation', () => {
  return expensiveCalculation();
});

// Get report
const report = performanceMonitor.getReport();
console.log(report);
```

### 2. React Native Performance Monitor

**Enable in App**:
1. Shake device (or press `Cmd+M` on iOS simulator)
2. Select "Show Perf Monitor"
3. Monitor FPS, memory, and UI thread

**Metrics to Watch**:
- FPS: Should stay at 60 FPS
- Memory: Should stay below 150MB
- UI Thread: Should not be blocked

### 3. Automated Performance Script

Run the performance testing script:

```bash
# Make script executable (first time only)
chmod +x scripts/performance-test.sh

# Run performance tests
./scripts/performance-test.sh
```

**What it measures**:
- App startup time
- Memory usage
- CPU usage
- Generates performance-results.txt

### 4. React DevTools Profiler

**Setup**:
1. Install React DevTools: `npm install -g react-devtools`
2. Start DevTools: `react-devtools`
3. Connect to app (shake device → "Debug")

**Usage**:
1. Open Profiler tab
2. Click "Record"
3. Perform actions in app
4. Stop recording
5. Analyze render times

**What to look for**:
- Components taking > 16ms to render
- Unnecessary re-renders
- Expensive calculations

### 5. Flipper

**Setup**:
1. Install Flipper: https://fbflipper.com/
2. Install React Native plugins
3. Connect device/emulator

**Features**:
- Network Inspector
- Layout Inspector
- Performance Profiler
- Logs Viewer

---

## 📋 Performance Testing Checklist

### App Startup
- [ ] Measure cold start time
- [ ] Measure warm start time
- [ ] Check for blocking operations
- [ ] Verify lazy loading works
- [ ] Check bundle size

### Screen Transitions
- [ ] Test all navigation flows
- [ ] Measure transition times
- [ ] Check for laggy screens
- [ ] Verify animations are smooth
- [ ] Check for unnecessary re-renders

### Memory Management
- [ ] Monitor memory usage over time
- [ ] Check for memory leaks
- [ ] Test with multiple screens
- [ ] Test with audio playback
- [ ] Test with images

### API Performance
- [ ] Measure API response times
- [ ] Check for redundant calls
- [ ] Verify caching works
- [ ] Test offline behavior
- [ ] Check payload sizes

### Audio Performance
- [ ] Measure audio load times
- [ ] Check playback latency
- [ ] Verify caching works
- [ ] Test offline playback
- [ ] Check memory usage with audio

---

## 🔍 Performance Profiling Steps

### Step 1: Baseline Measurement

1. **Run Performance Script**:
   ```bash
   ./scripts/performance-test.sh
   ```

2. **Enable Performance Monitor**:
   - Shake device → "Show Perf Monitor"
   - Note baseline metrics

3. **Use React DevTools**:
   - Record baseline profile
   - Note render times

4. **Document Baseline**:
   - Startup time: _____ ms
   - Memory usage: _____ MB
   - CPU usage: _____ %
   - FPS: _____ 

### Step 2: Identify Bottlenecks

1. **Check Performance Monitor**:
   - Look for slow operations
   - Identify blocking calls

2. **Profile Components**:
   - Find slow renders
   - Identify unnecessary re-renders

3. **Check Network**:
   - Find slow API calls
   - Identify redundant requests

4. **Monitor Memory**:
   - Check for leaks
   - Find memory spikes

### Step 3: Optimize

1. **Code Optimization**:
   - Add React.memo where needed
   - Use useMemo/useCallback
   - Optimize loops

2. **Component Optimization**:
   - Lazy load screens
   - Optimize list rendering
   - Reduce re-renders

3. **Data Optimization**:
   - Implement caching
   - Batch API calls
   - Optimize queries

4. **Image/Audio Optimization**:
   - Compress files
   - Implement lazy loading
   - Use appropriate formats

### Step 4: Validate

1. **Re-run Performance Script**:
   ```bash
   ./scripts/performance-test.sh
   ```

2. **Compare Results**:
   - Startup time: Before _____ → After _____
   - Memory usage: Before _____ → After _____
   - CPU usage: Before _____ → After _____

3. **Verify Improvements**:
   - All metrics improved
   - No regressions
   - App still works correctly

---

## 📊 Performance Metrics Dashboard

### Current Metrics (Update After Testing)

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| App Startup | < 2s | _____ | ⚪ |
| Screen Transition | < 300ms | _____ | ⚪ |
| Memory Usage | < 150MB | _____ | ⚪ |
| CPU Usage (Idle) | < 10% | _____ | ⚪ |
| FPS | 60 | _____ | ⚪ |
| Prayer Time Calc | < 100ms | _____ | ⚪ |
| API Response | < 2s | _____ | ⚪ |

---

## 🐛 Common Performance Issues

### Slow App Startup
**Causes**:
- Heavy imports at startup
- Blocking API calls
- Large bundle size
- Synchronous operations

**Solutions**:
- Lazy load modules
- Move API calls to after render
- Code splitting
- Use async initialization

### Slow Screen Transitions
**Causes**:
- Unnecessary re-renders
- Heavy computations
- Large component trees
- Missing memoization

**Solutions**:
- Add React.memo
- Use useMemo/useCallback
- Optimize component structure
- Lazy load screens

### High Memory Usage
**Causes**:
- Memory leaks
- Large images
- Unclosed subscriptions
- Cached data accumulation

**Solutions**:
- Clean up subscriptions
- Optimize image sizes
- Clear caches periodically
- Use weak references

### High CPU Usage
**Causes**:
- Expensive calculations
- Frequent re-renders
- Heavy animations
- Background processing

**Solutions**:
- Memoize calculations
- Reduce re-renders
- Optimize animations
- Move work to background threads

---

## 📝 Performance Testing Report Template

```markdown
# Performance Testing Report

**Date**: __________  
**Device**: __________  
**OS Version**: __________  
**App Version**: __________

## Baseline Metrics
- Startup Time: _____ ms
- Memory Usage: _____ MB
- CPU Usage: _____ %
- FPS: _____

## Issues Found
1. __________
2. __________
3. __________

## Optimizations Applied
1. __________
2. __________
3. __________

## Results After Optimization
- Startup Time: _____ ms (Improvement: _____%)
- Memory Usage: _____ MB (Improvement: _____%)
- CPU Usage: _____ % (Improvement: _____%)
- FPS: _____ (Improvement: _____%)

## Recommendations
1. __________
2. __________
3. __________
```

---

## 🚀 Quick Start

### 1. Run Automated Tests
```bash
./scripts/performance-test.sh
```

### 2. Enable Performance Monitor
- Shake device → "Show Perf Monitor"
- Monitor metrics while using app

### 3. Profile with DevTools
- Start React DevTools
- Record profile
- Analyze results

### 4. Document Findings
- Use checklist above
- Create performance report
- Track improvements

---

## 📚 Additional Resources

- [React Native Performance](https://reactnative.dev/docs/performance)
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)
- [Flipper Documentation](https://fbflipper.com/docs/)
- [Performance Best Practices](https://reactnative.dev/docs/performance#common-sources-of-performance-problems)

---

**Last Updated**: December 22, 2024

