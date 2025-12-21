# iOS Build: Full Disk Access Required - Restart Needed

## Current Status

✅ **Fallback mechanism working**: The script correctly detects rsync failure and tries `cp` as fallback  
❌ **Sandbox still blocking**: Even `cp` is being denied by the sandbox

## Error Analysis

```
⚠️  rsync failed (likely sandbox issue), using cp as fallback...
error: Sandbox: cp(15955) deny(1) file-write-create
```

This indicates that:
1. ✅ Xcode has been added to Full Disk Access
2. ❌ Full Disk Access hasn't taken effect yet (requires restart)

## Solution: Restart Your Mac

**Full Disk Access changes require a system restart to take effect.**

### Steps:

1. **Save your work**
2. **Restart your Mac** (Apple menu > Restart)
3. **After restart**, try building:
   ```bash
   npx react-native run-ios --simulator="iPhone 17"
   ```

### Why Restart is Required

macOS security settings (like Full Disk Access) are enforced at the kernel level. Changes to these settings require:
- A system restart to reload security policies
- Or in some cases, logging out and back in

The sandbox restrictions are applied when Xcode launches, so even if you quit and reopen Xcode, the old restrictions may still apply until the system restarts.

## After Restart

Once your Mac restarts:

1. **Verify Full Disk Access**:
   - System Settings > Privacy & Security > Full Disk Access
   - Ensure Xcode.app is checked ✅

2. **Try building**:
   ```bash
   npx react-native run-ios --simulator="iPhone 17"
   ```

3. **Expected behavior**:
   - rsync should work (with Full Disk Access)
   - If rsync still fails, fallback to `cp` should work
   - Build should complete successfully

## Current Workarounds in Place

We've already implemented:
- ✅ rsync → cp fallback (working, but cp also blocked)
- ✅ rsync → ditto → cp fallback chain (updated)
- ✅ Podfile auto-patching (will reapply on `pod install`)

After restart, these should all work properly.

## If Restart Doesn't Work

If after restarting, you still see sandbox errors:

1. **Verify Full Disk Access again**:
   - System Settings > Privacy & Security > Full Disk Access
   - Make sure Xcode.app is enabled
   - Try toggling it off and on again

2. **Check for other security software**:
   - Antivirus or security tools may interfere
   - Temporarily disable to test

3. **Try alternative approach**:
   - We can modify the Xcode project to disable sandbox for specific script phases
   - This is more complex but may be necessary

## Summary

**Action Required**: Restart your Mac  
**Reason**: Full Disk Access changes need a restart to take effect  
**After Restart**: Build should work with Full Disk Access enabled
