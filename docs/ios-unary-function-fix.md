# iOS Build Fix: std::unary_function Deprecation Error

## Issue
```
No template named 'unary_function' in namespace 'std'; did you mean '_unary_function'?
```

**Location**: `boost/boost/container_hash/hash.hpp:131`

**Cause**: `std::unary_function` was deprecated in C++11 and removed in C++17. The boost library is using it, but the compiler (with C++17 standard) doesn't have it.

## Solution

### Manual Fix (Applied)
Patched `ios/Pods/boost/boost/container_hash/hash.hpp` to add a compatibility workaround:

```cpp
// Compatibility workaround for C++17 (std::unary_function removed)
#if __cplusplus >= 201703L
namespace std {
  template<typename Arg, typename Result>
  struct unary_function {
    typedef Arg argument_type;
    typedef Result result_type;
  };
}
#endif
```

### Automatic Fix (Podfile)
Updated `ios/Podfile` to automatically apply this patch during `pod install`.

## Build Steps

1. **Clean build**:
   ```bash
   cd ios
   xcodebuild clean -workspace SalahCompanion.xcworkspace -scheme SalahCompanion
   ```

2. **Rebuild in Xcode**:
   - Press `Cmd + R` in Xcode
   - Or use: `npx react-native run-ios --simulator="iPhone 17"`

## Note
This patch will be reapplied automatically when you run `pod install` thanks to the Podfile post_install hook.
