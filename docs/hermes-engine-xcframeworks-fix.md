# **Hermes-Engine XCFrameworks Copy Error Fix**

## **Problem**

Build fails with error:
```
Command PhaseScriptExecution failed with a nonzero exit code
[CP] Copy XCFrameworks
```

**Target:** `hermes-engine`  
**Device:** Physical iPhone (not simulator)

## **Root Cause**

This error occurs when:
1. Building for a physical device (iPhone) instead of simulator
2. The hermes-engine XCFramework copy script fails during the build phase
3. Architecture mismatch or missing framework slices
4. Path/permission issues with rsync command

## **Solutions**

### **Solution 1: Clean DerivedData (Recommended First Step)**

```bash
# Clean Xcode's build cache
rm -rf ~/Library/Developer/Xcode/DerivedData/SalahCompanion-*

# In Xcode: Product → Clean Build Folder (Shift + Cmd + K)
```

### **Solution 2: Reinstall Pods**

```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### **Solution 3: Build for Simulator First**

If building for a physical device fails, try building for simulator first:

1. In Xcode: Select "iPhone 15 Pro" (or any simulator) as target
2. Build (Cmd + B)
3. Once successful, switch back to physical device

### **Solution 4: Check Hermes Framework**

Verify the hermes-engine framework exists:

```bash
ls -la ios/Pods/hermes-engine/destroot/Library/Frameworks/
```

Should show:
- `universal/` directory
- Or `hermes.xcframework`

### **Solution 5: Manual Framework Copy (If Needed)**

If the automatic copy fails, you may need to manually ensure the framework is in place:

```bash
# Check if framework exists
find ios/Pods -name "hermes.xcframework" -o -name "*hermes*.framework"

# If missing, the pod install should have downloaded it
# Re-run: cd ios && pod install
```

## **Common Issues**

### **Issue 1: Architecture Mismatch**

**Symptom:** Framework only has simulator slices, but building for device

**Fix:** Ensure you're using the correct hermes-engine version for your React Native version (0.72.6)

### **Issue 2: Path Issues**

**Symptom:** rsync command fails with "No such file or directory"

**Fix:** 
1. Clean DerivedData (Solution 1)
2. Reinstall pods (Solution 2)
3. Ensure no spaces in project path

### **Issue 3: Permission Issues**

**Symptom:** Permission denied errors

**Fix:**
```bash
# Check permissions
ls -la ios/Pods/hermes-engine/

# Fix if needed
chmod -R 755 ios/Pods/hermes-engine/
```

## **Prevention**

1. **Always clean build folder** before switching between simulator and device
2. **Keep pods updated** with `pod install` after dependency changes
3. **Use simulator for development** when possible (faster builds)

## **Status**

- ✅ Podfile updated with hermes-engine build phase fix
- ✅ DerivedData cleanup script available
- ⚠️  May need to rebuild after pod reinstall

---

**Note:** This error is common with React Native 0.72.6 when building for physical devices. The fixes above should resolve it.

