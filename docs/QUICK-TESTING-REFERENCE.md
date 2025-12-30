# Quick Testing Reference

**Quick commands and checklists for testing**

---

## 🚀 Quick Commands

### Run Tests
```bash
# All tests
npm test

# E2E tests only
npm test -- tests/e2e

# Integration tests only
npm test -- tests/integration

# Specific test file
npm test -- tests/e2e/recitation-practice.test.ts

# With coverage
npm run test:coverage
```

### Device Testing
```bash
# Run device test script
./scripts/device-test.sh

# Check connected devices
adb devices

# View logs
adb logcat

# Install app
npm run android
```

### Performance Testing
```bash
# Run performance test script
./scripts/performance-test.sh

# Enable performance monitor in app
# Shake device → "Show Perf Monitor"
```

---

## ✅ Test Status

### Current Status
- **Total Tests**: 105+ passing
- **E2E Tests**: 38/38 passing
- **Integration Tests**: All passing
- **Unit Tests**: All passing

### Test Files
- ✅ `tests/e2e/recitation-practice.test.ts` - 9 tests
- ✅ `tests/e2e/pronunciation-academy.test.ts` - 10 tests
- ✅ `tests/e2e/achievement-system.test.ts` - 10 tests
- ✅ `tests/e2e/audio-integration.test.ts` - 9 tests
- ✅ `tests/integration/navigation-flows.test.ts` - All passing
- ✅ `tests/integration/data-persistence.test.ts` - 7 tests

---

## 📋 Quick Checklists

### Before Testing
- [ ] Run `npm test` - all tests pass
- [ ] Device connected or emulator running
- [ ] App installed on device
- [ ] All permissions granted

### Device Testing
- [ ] Run `./scripts/device-test.sh`
- [ ] Test core features
- [ ] Test Phase 2 features
- [ ] Check performance
- [ ] Document bugs

### Performance Testing
- [ ] Run `./scripts/performance-test.sh`
- [ ] Enable performance monitor
- [ ] Profile with DevTools
- [ ] Document metrics

---

## 🐛 Quick Bug Report

```markdown
**Bug**: [Brief description]
**Severity**: Critical / High / Medium / Low
**Device**: [Device model and OS]
**Steps**: 
1. Step 1
2. Step 2
3. Step 3
**Expected**: [What should happen]
**Actual**: [What actually happens]
```

---

## 📊 Performance Quick Check

| Metric | Target | Check |
|--------|--------|-------|
| Startup | < 2s | ⚪ |
| Memory | < 150MB | ⚪ |
| CPU | < 10% | ⚪ |
| FPS | 60 | ⚪ |

---

**Last Updated**: December 22, 2024

