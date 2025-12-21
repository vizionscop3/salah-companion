# Test 1: Word Practice Mode - Quick Start Guide

**Estimated Time**: 10 minutes  
**Status**: Ready to Test

---

## 🚀 Pre-Test Setup (2 minutes)

### Step 1: Start Metro Bundler
```bash
# Terminal 1
cd /Users/vizion/Documents/SALAH
npm run dev
```

**Expected**: Metro bundler starts, shows "Metro waiting on port 8081"

---

### Step 2: Start the App
```bash
# Terminal 2 (new terminal)
cd /Users/vizion/Documents/SALAH
npm run android
# OR for iOS:
# npm run ios
```

**Expected**: App builds and launches on device/emulator

---

### Step 3: Login/Register
- [ ] App launches
- [ ] Can register new account OR login
- [ ] Navigate to home screen
- [ ] Verify app is functional

---

## 📱 Test 1: Word Practice Mode (8 minutes)

### Navigation Path
```
Home Screen
  → Learning Tab
    → Recitation Practice
      → Select "Word-by-Word" mode
        → Word Practice Screen
```

### What to Test

#### ✅ Test 1.1: Screen Loads
**Action**: Navigate to Word Practice screen  
**Expected**:
- Screen loads without errors
- Shows Surah 1, Ayah 1, Word 0 (first word)
- Arabic text visible
- Buttons visible (Play Reference, Start Recording)

**Result**: ✅ Pass / ❌ Fail  
**Notes**: _________________________

---

#### ✅ Test 1.2: Text Display
**Action**: Look at the screen  
**Expected**:
- Arabic word displays correctly
- Transliteration shows below Arabic
- Translation shows (if available)
- Current word is highlighted/indicated

**Result**: ✅ Pass / ❌ Fail  
**Notes**: _________________________

---

#### ✅ Test 1.3: Audio Playback
**Action**: Tap "Play Reference" button  
**Expected**:
- Audio plays (word-level or ayah-level)
- Audio quality is acceptable
- No errors in console
- Can tap again to replay

**Result**: ✅ Pass / ❌ Fail  
**Notes**: _________________________

**Console Check**: 
```bash
# In Metro bundler terminal, look for:
# - Audio download messages
# - Playback success messages
# - Any error messages
```

---

#### ✅ Test 1.4: Recording
**Action**: 
1. Tap "Start Recording"
2. Speak the Arabic word clearly
3. Tap "Stop Recording"

**Expected**:
- Recording starts (indicator shows)
- Microphone permission granted (if first time)
- Recording stops successfully
- "Analyzing..." indicator appears

**Result**: ✅ Pass / ❌ Fail  
**Notes**: _________________________

**Console Check**: Look for recording-related messages

---

#### ✅ Test 1.5: Analysis & Feedback
**Action**: Wait for analysis to complete  
**Expected**:
- Analysis completes (usually 2-5 seconds)
- Accuracy score displays (0-100%)
- Word feedback appears
- Feedback is helpful

**Result**: ✅ Pass / ❌ Fail  
**Notes**: _________________________

**Accuracy Score**: ___%  
**Feedback Quality**: Good / Acceptable / Poor

---

#### ✅ Test 1.6: Progress Saving
**Action**: Check if practice was saved  
**Expected**:
- Practice session saved to database
- No errors in console
- Can navigate away and back

**Result**: ✅ Pass / ❌ Fail  
**Notes**: _________________________

---

#### ✅ Test 1.7: Navigation Between Words
**Action**: 
- Tap "Next Word" button
- Tap "Previous Word" button

**Expected**:
- Word index updates
- New word displays
- Previous feedback clears
- Can navigate through all words

**Result**: ✅ Pass / ❌ Fail  
**Notes**: _________________________

---

## 🐛 Issue Documentation

### Critical Issues (App Crashes, Data Loss)
1. **Issue**: _________________________
   - **When**: _________________________
   - **Steps**: _________________________
   - **Error Message**: _________________________

### High Priority Issues (Feature Broken)
1. **Issue**: _________________________
   - **When**: _________________________
   - **Steps**: _________________________

### Medium Priority Issues (Minor Bugs)
1. **Issue**: _________________________
   - **When**: _________________________
   - **Steps**: _________________________

---

## ✅ Test 1 Completion

**Status**: ✅ Complete / ❌ Failed / ⚠️ Partial  
**Time Taken**: ___ minutes  
**Issues Found**: ___ critical, ___ high, ___ medium

**Ready for Test 2?**: Yes / No

---

## 📝 Next Steps

After completing Test 1:
1. Document all issues in `docs/test-execution-log.md`
2. Take screenshots of any issues (if possible)
3. Note console errors
4. Proceed to Test 2: Ayah Practice Mode

---

*Last Updated: December 18, 2025*
