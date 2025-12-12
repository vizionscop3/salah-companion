# **iOS Setup - Boost Library Issue**

## **Issue**

When running `pod install`, you may encounter an error with the boost library:

```
[!] Error installing boost
tar: Error opening archive: Unrecognized archive format
```

This is a known issue with React Native 0.72.6 where the boost library download from the jfrog repository can fail.

## **Workaround Solutions**

### **Solution 1: Manual Download (Recommended)**

1. **Download boost manually:**
   ```bash
   cd ~/Downloads
   curl -L -o boost_1_76_0.tar.bz2 https://archives.boost.io/release/1.76.0/source/boost_1_76_0.tar.bz2
   ```

2. **Place it in CocoaPods cache:**
   ```bash
   mkdir -p ~/Library/Caches/CocoaPods/Pods/External/boost
   cp ~/Downloads/boost_1_76_0.tar.bz2 ~/Library/Caches/CocoaPods/Pods/External/boost/
   ```

3. **Retry pod install:**
   ```bash
   cd ios
   pod install
   ```

### **Solution 2: Use Alternative Source**

Edit `node_modules/react-native/third-party-podspecs/boost.podspec`:

```ruby
spec.source = { :http => 'https://archives.boost.io/release/1.76.0/source/boost_1_76_0.tar.bz2' }
```

Then run:
```bash
cd ios
pod install
```

### **Solution 3: Skip Checksum Verification**

Edit `node_modules/react-native/third-party-podspecs/boost.podspec` and remove the `:sha256` line:

```ruby
spec.source = { :http => 'https://boostorg.jfrog.io/artifactory/main/release/1.76.0/source/boost_1_76_0.tar.bz2' }
```

**Note:** This is less secure but may work if the download succeeds.

### **Solution 4: Use Pre-downloaded Boost**

If you have boost already downloaded:

```bash
# Find your CocoaPods cache
pod cache list boost

# Or manually place the file
mkdir -p ~/Library/Caches/CocoaPods/Pods/External/boost
# Copy your boost_1_76_0.tar.bz2 file here
```

## **Alternative: Continue Without iOS for Now**

You can continue development on Android while resolving the iOS boost issue:

```bash
# Android doesn't have this issue
npm run android
```

## **Status**

- ✅ CocoaPods installed (1.16.2)
- ✅ Most pods installed successfully
- ⚠️ Boost library download issue (known React Native 0.72.6 issue)
- ✅ Android setup should work fine

## **Next Steps**

1. Try Solution 1 (manual download) - most reliable
2. If that doesn't work, try Solution 2 (alternative source)
3. Continue with Android development in the meantime
4. iOS can be set up later once boost issue is resolved

---

**Reference:** This is a known issue with React Native 0.72.6. Consider upgrading to a newer React Native version in the future if this becomes a blocker.

