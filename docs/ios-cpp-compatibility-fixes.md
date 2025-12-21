# iOS C++ Compatibility Fixes

## Overview
This document details the C++ compatibility fixes applied to resolve build errors in the iOS project, specifically related to C++17 standard changes and namespace resolution.

## Issues Fixed

### 1. `std::unary_function` Deprecation (C++17)

**Error**: `Reference to 'unary_function' is ambiguous`

**Root Cause**: `std::unary_function` was removed in C++17, but Boost library code still references it.

**Solution**: Use a local compatibility struct instead of defining in `std` namespace to avoid ambiguity.

**Location**: `ios/Pods/boost/boost/container_hash/hash.hpp`

**Fix Applied**:
```cpp
// Compatibility workaround for C++17 (std::unary_function removed)
#if __cplusplus >= 201703L
// Define local compatibility struct to avoid std namespace pollution
template<typename Arg, typename Result>
struct unary_function_compat {
    typedef Arg argument_type;
    typedef Result result_type;
};
template <typename T>
struct hash_base : unary_function_compat<T, std::size_t> {};
#else
template <typename T>
struct hash_base : std::unary_function<T, std::size_t> {};
#endif
```

### 2. `insert_or_assign` Missing (C++17 Feature)

**Error**: `No member named 'insert_or_assign' in 'std::unordered_map<...>'`

**Root Cause**: `insert_or_assign` is a C++17 feature, but the compiler might not recognize C++17 mode.

**Solution**: Enhanced feature detection with both `__cplusplus` and feature macro checks.

**Location**: `ios/Pods/RCT-Folly/folly/executors/IOThreadPoolDeadlockDetectorObserver.cpp`

**Fix Applied**:
```cpp
// Compatibility: use insert_or_assign (C++17) or fallback to erase+insert
auto locked = detectors_.wlock();
#if defined(__cpp_lib_unordered_map_try_emplace) || __cplusplus >= 201703L
  // C++17: use insert_or_assign
  locked->insert_or_assign(h, deadlockDetectorFactory_->create(eventBase, name_));
#else
  // C++14 fallback: erase then insert
  locked->erase(h);
  locked->insert({h, deadlockDetectorFactory_->create(eventBase, name_)});
#endif
```

### 3. Namespace Shadowing

**Error**: `No type named 'size_t' in namespace 'boost::hash_detail::std'`

**Root Cause**: Defining `namespace std` inside `boost::hash_detail` created `boost::hash_detail::std`, shadowing the global `::std`.

**Solution**: Use global namespace qualifier `::std::` in affected functions.

**Location**: `ios/Pods/boost/boost/container_hash/hash.hpp` (hash_value functions)

**Fix Applied**:
- Changed `std::size_t` → `::std::size_t`
- Changed `std::numeric_limits` → `::std::numeric_limits`

## Podfile Auto-Patching

The `ios/Podfile` includes `post_install` hooks that automatically apply these fixes during `pod install`:

1. **RCT-Folly C++17 Standard**: Sets `CLANG_CXX_LANGUAGE_STANDARD = 'c++17'`
2. **insert_or_assign Patch**: Automatically patches `IOThreadPoolDeadlockDetectorObserver.cpp`
3. **unary_function Patch**: Automatically patches `hash.hpp` with compatibility struct
4. **Namespace Fixes**: Automatically applies `::std::` qualifiers

## Build Steps

1. **Clean build**:
   ```bash
   cd ios
   xcodebuild clean -workspace SalahCompanion.xcworkspace -scheme SalahCompanion
   ```

2. **Rebuild in Xcode**:
   - Press `Cmd + R` in Xcode
   - Or use: `npx react-native run-ios --simulator="iPhone 17"`

## Related Files

- `ios/Podfile`: Contains auto-patching logic
- `ios/Pods/boost/boost/container_hash/hash.hpp`: Manual patches applied
- `ios/Pods/RCT-Folly/folly/executors/IOThreadPoolDeadlockDetectorObserver.cpp`: Manual patches applied

## Notes

- Manual patches in `Pods/` directory will be overwritten on `pod install`
- Podfile `post_install` hooks ensure fixes are re-applied automatically
- All fixes maintain backward compatibility with C++14
