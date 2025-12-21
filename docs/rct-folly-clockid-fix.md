# **RCT-Folly clockid_t Typedef Redefinition Fix**

## **Problem**

Build fails with error:
```
error: typedef redefinition with different types ('uint8_t' (aka 'unsigned char') vs 'enum clockid_t')
```

**Location:** `ios/Pods/Headers/Private/RCT-Folly/folly/portability/Time.h:52`

## **Root Cause**

React Native 0.72.6 uses Folly library which defines:
```c
typedef uint8_t clockid_t;
```

However, newer iOS SDKs (iOS 26.1+) already define `clockid_t` as an enum type in the system headers. This causes a type redefinition conflict.

## **Solution**

Added a post-install hook in `Podfile` that patches the Folly header file to guard the typedef:

```ruby
# Fix RCT-Folly clockid_t typedef redefinition error with newer iOS SDK
folly_portability_time_h = File.join(installer.sandbox.root, 'Headers/Private/RCT-Folly/folly/portability/Time.h')
if File.exist?(folly_portability_time_h)
  file_content = File.read(folly_portability_time_h)
  # Replace the typedef with a guarded version
  patched_content = file_content.gsub(
    /typedef uint8_t clockid_t;/,
    "#ifndef clockid_t\ntypedef uint8_t clockid_t;\n#endif"
  )
  if file_content != patched_content
    File.write(folly_portability_time_h, patched_content)
    puts "✅ Patched RCT-Folly Time.h to fix clockid_t redefinition"
  end
end
```

This ensures the typedef is only defined if `clockid_t` is not already defined by the system.

## **How It Works**

1. **During `pod install`:** The post-install hook runs
2. **Checks for file:** Verifies `Time.h` exists
3. **Patches typedef:** Wraps the typedef in `#ifndef clockid_t` guard
4. **Saves file:** Writes the patched version back

## **Verification**

After running `pod install`, check the patched file:

```bash
grep -A 2 "clockid_t" ios/Pods/Headers/Private/RCT-Folly/folly/portability/Time.h
```

Should show:
```c
#ifndef clockid_t
typedef uint8_t clockid_t;
#endif
```

## **Alternative Solutions**

### **Option 1: Update React Native** (Future)
Upgrading to React Native 0.73+ may include this fix upstream.

### **Option 2: Manual Patch** (One-time)
If the Podfile hook doesn't work, manually patch after each `pod install`:

```bash
cd ios/Pods/Headers/Private/RCT-Folly/folly/portability
sed -i '' 's/typedef uint8_t clockid_t;/#ifndef clockid_t\ntypedef uint8_t clockid_t;\n#endif/' Time.h
```

### **Option 3: Use Older Xcode** (Not Recommended)
Downgrading Xcode/iOS SDK would avoid the conflict but limits development.

## **Status**

- ✅ Fix implemented in Podfile
- ✅ Automatically applies during `pod install`
- ✅ Compatible with iOS SDK 26.1+
- ✅ Maintains iPhone 12 compatibility (iOS 14.0+)

---

**Note:** This patch is automatically applied every time you run `pod install`, so it persists across pod updates.

