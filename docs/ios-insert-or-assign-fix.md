# iOS Build Fix: insert_or_assign Error

## Issue
```
No member named 'insert_or_assign' in 'std::unordered_map<...>'
```

**Location**: `RCT-Folly/folly/executors/IOThreadPoolDeadlockDetectorObserver.cpp:36`

**Cause**: `insert_or_assign` is a C++17 feature. The code needs C++17 to compile.

## Solution

### Manual Fix (Applied)
Patched `IOThreadPoolDeadlockDetectorObserver.cpp` to add C++17 compatibility check:

```cpp
// Compatibility: use insert_or_assign (C++17) or fallback to erase+insert
auto locked = detectors_.wlock();
#if __cplusplus >= 201703L
  locked->insert_or_assign(h, deadlockDetectorFactory_->create(eventBase, name_));
#else
  locked->erase(h);
  locked->insert({h, deadlockDetectorFactory_->create(eventBase, name_)});
#endif
```

### Podfile Configuration
Updated `ios/Podfile` to ensure RCT-Folly uses C++17:
- Set `CLANG_CXX_LANGUAGE_STANDARD = 'c++17'` for RCT-Folly target
- Set `CLANG_CXX_LIBRARY = 'libc++'`

## Build Steps

1. **Clean build**:
   ```bash
   cd ios
   xcodebuild clean -workspace SalahCompanion.xcworkspace -scheme SalahCompanion
   ```

2. **Rebuild in Xcode**:
   - Press `Cmd + R` in Xcode
   - Or use: `npx react-native run-ios --simulator="iPhone 17"`

## Related Fixes

- ✅ `std::unary_function` compatibility (boost hash.hpp)
- ✅ `insert_or_assign` compatibility (RCT-Folly)

Both fixes ensure C++17 compatibility while maintaining backward compatibility.
