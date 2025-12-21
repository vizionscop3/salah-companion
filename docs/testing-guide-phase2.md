# Phase 2 Testing Guide

**Status**: 🟡 In Progress  
**Test Results**: ✅ 56 tests passing (10 test suites)

---

## 🎯 Quick Start

### 1. Verify Test Suite
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode (for development)
npm run test:watch
```

**Current Status**: ✅ All 56 tests passing

---

## 📱 Manual Testing Setup

### Step 1: Start the App
```bash
# Terminal 1: Start Metro bundler
npm run dev

# Terminal 2: Run on Android
npm run android

# Or run on iOS (if available)
npm run ios
```

### Step 2: Prepare Test Environment
- [ ] App launches successfully
- [ ] Database connected
- [ ] Can log in/register
- [ ] Navigation works

---

## 🧪 Testing Workflow

### Phase 1: Core Feature Testing (Start Here)

#### Test 1: Recitation Practice - Word Mode
**Time**: ~10 minutes

1. Navigate: Home → Learning → Recitation Practice → Word Practice
2. Select: Surah 1 (Al-Fatiha), Ayah 1
3. Verify:
   - [ ] Arabic text displays
   - [ ] Transliteration shows
   - [ ] Translation shows
   - [ ] Reference audio plays (tap play button)
4. Record:
   - [ ] Tap "Start Recording"
   - [ ] Speak the word
   - [ ] Tap "Stop Recording"
   - [ ] Wait for analysis
5. Check Results:
   - [ ] Accuracy score displays
   - [ ] Feedback appears
   - [ ] Progress saved

**Document Issues**: _________________________

---

#### Test 2: Recitation Practice - Ayah Mode
**Time**: ~10 minutes

1. Navigate: Recitation Practice → Ayah Practice
2. Select: Surah 1, Ayah 1
3. Verify:
   - [ ] Full ayah displays
   - [ ] All words visible
4. Record:
   - [ ] Record full ayah
   - [ ] Check duration tracking
5. Check Results:
   - [ ] Ayah-level analysis shows
   - [ ] Overall accuracy displays
   - [ ] Word breakdown appears

**Document Issues**: _________________________

---

#### Test 3: Recitation Practice - Surah Mode
**Time**: ~15 minutes

1. Navigate: Recitation Practice → Surah Practice
2. Select: Surah 112 (Al-Ikhlas) - short surah for testing
3. Verify:
   - [ ] All ayahs display
   - [ ] Scrollable list works
4. Record:
   - [ ] Record full surah
   - [ ] Check position tracking
5. Check Results:
   - [ ] Surah-level analysis
   - [ ] Ayah breakdown
   - [ ] Improvement areas

**Document Issues**: _________________________

---

#### Test 4: Pronunciation Academy
**Time**: ~15 minutes

1. Navigate: Learning → Pronunciation Academy
2. Verify:
   - [ ] Letter grid displays
   - [ ] All 28 letters visible
   - [ ] Categories filter works
3. Select a letter:
   - [ ] Letter details show
   - [ ] Pronunciation info displays
4. Practice:
   - [ ] Tap "Practice" button
   - [ ] Play reference audio (TTS)
   - [ ] Record pronunciation
   - [ ] Check accuracy score
5. Progress:
   - [ ] Practice count updates
   - [ ] "Learned" status updates (if accuracy high)

**Document Issues**: _________________________

---

#### Test 5: Achievement System
**Time**: ~10 minutes

1. Navigate: Profile → Achievements
2. Verify:
   - [ ] Achievement grid displays
   - [ ] Locked/unlocked states correct
3. Trigger Achievement:
   - [ ] Complete a prayer (to trigger prayer achievement)
   - [ ] Practice recitation (to trigger recitation achievement)
   - [ ] Practice pronunciation (to trigger pronunciation achievement)
4. Check:
   - [ ] Achievement unlocks
   - [ ] Modal appears
   - [ ] XP awarded
   - [ ] Home screen shows recent achievements

**Document Issues**: _________________________

---

#### Test 6: Analytics Display
**Time**: ~5 minutes

1. Navigate: Profile
2. Verify:
   - [ ] Recitation stats card shows
   - [ ] Pronunciation stats card shows
   - [ ] Statistics are accurate
3. Check:
   - [ ] Practice counts correct
   - [ ] Accuracy trends show
   - [ ] Most practiced items listed

**Document Issues**: _________________________

---

### Phase 2: Audio Integration Testing

#### Test 7: Hugging Face Audio
**Time**: ~10 minutes

1. Test Ayah Audio:
   - [ ] Navigate to recitation practice
   - [ ] Play reference audio
   - [ ] Verify audio downloads (check console/logs)
   - [ ] Verify audio caches
   - [ ] Play again (should use cache)
2. Test Word Audio:
   - [ ] Navigate to word practice
   - [ ] Play word audio
   - [ ] Verify caching works
3. Test Offline:
   - [ ] Turn off network
   - [ ] Try to play cached audio
   - [ ] Verify offline playback works

**Document Issues**: _________________________

---

#### Test 8: TTS Integration
**Time**: ~5 minutes

1. Test Letter Audio:
   - [ ] Navigate to pronunciation academy
   - [ ] Select a letter
   - [ ] Play reference audio
   - [ ] Verify TTS plays
   - [ ] Check pronunciation quality
2. Test Prayer Phrases:
   - [ ] Navigate to guided salah
   - [ ] Play a phrase (Takbir, Ruku, etc.)
   - [ ] Verify TTS fallback works

**Document Issues**: _________________________

---

### Phase 3: Integration Testing

#### Test 9: Complete User Journey
**Time**: ~15 minutes

**Journey 1: New User**
1. [ ] Register new account
2. [ ] Complete onboarding
3. [ ] View home screen
4. [ ] Practice recitation
5. [ ] Practice pronunciation
6. [ ] Check achievements
7. [ ] View profile

**Journey 2: Returning User**
1. [ ] Login
2. [ ] Check progress
3. [ ] Continue practice
4. [ ] View analytics

**Document Issues**: _________________________

---

#### Test 10: Data Persistence
**Time**: ~10 minutes

1. Complete Practice:
   - [ ] Practice recitation
   - [ ] Practice pronunciation
   - [ ] Unlock achievement
2. Close App:
   - [ ] Force close app
   - [ ] Restart app
3. Verify:
   - [ ] Progress persists
   - [ ] Achievements persist
   - [ ] Analytics updated

**Document Issues**: _________________________

---

### Phase 4: Error Handling

#### Test 11: Network Errors
**Time**: ~10 minutes

1. Turn Off Network:
   - [ ] Disable WiFi/data
   - [ ] Try to practice recitation
   - [ ] Verify graceful error handling
   - [ ] Verify offline features work
2. Restore Network:
   - [ ] Re-enable network
   - [ ] Verify app recovers
   - [ ] Verify data syncs

**Document Issues**: _________________________

---

#### Test 12: API Failures
**Time**: ~5 minutes

1. Test Fallbacks:
   - [ ] If Hugging Face fails, API fallback works
   - [ ] If API fails, TTS fallback works
   - [ ] Error messages are clear
   - [ ] App doesn't crash

**Document Issues**: _________________________

---

## 📊 Test Results Template

### Test Session: [Date]

**Tests Completed**: ___ / 12  
**Issues Found**: ___

### Critical Issues
1. _________________________
2. _________________________

### High Priority Issues
1. _________________________
2. _________________________

### Medium Priority Issues
1. _________________________
2. _________________________

### Notes
_________________________
_________________________

---

## 🔧 Quick Fixes for Common Issues

### Issue: Audio Not Playing
- Check: Network connection
- Check: Audio permissions
- Check: Console for errors
- Try: Restart app

### Issue: Recording Not Working
- Check: Microphone permissions
- Check: Device microphone
- Try: Restart app

### Issue: Analysis Not Working
- Check: API keys configured (if using external APIs)
- Check: Network connection
- Verify: Fallback to mock works

### Issue: Progress Not Saving
- Check: Database connection
- Check: Console for errors
- Verify: Database migrations run

---

## ✅ Testing Checklist Status

Use the detailed checklist in `docs/phase2-testing-checklist.md` to track all items.

**Current Progress**: 
- [ ] Phase 1: Core Features (0/6)
- [ ] Phase 2: Audio Integration (0/2)
- [ ] Phase 3: Integration (0/2)
- [ ] Phase 4: Error Handling (0/2)

---

## 🚀 Next Steps After Testing

1. **Document All Issues** - Use the checklist
2. **Prioritize Fixes** - Critical → High → Medium → Low
3. **Fix Issues** - Work through priority list
4. **Re-test** - Verify fixes work
5. **Device Testing** - Test on physical devices
6. **Performance Testing** - Profile and optimize

---

*Last Updated: December 18, 2025*
