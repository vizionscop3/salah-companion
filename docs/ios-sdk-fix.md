# **iOS SDK Issue - Resolution Guide**

## **Problem**

The active developer directory is set to Command Line Tools only (`/Library/Developer/CommandLineTools`), but React Native requires the full Xcode installation to access the iOS SDK.

## **Solution**

You need to switch the active developer directory to point to the full Xcode installation.

### **Step 1: Switch to Xcode Developer Directory**

Run this command in your terminal (it will ask for your password):

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

### **Step 2: Verify the Change**

Check that it worked:

```bash
xcode-select -p
# Should output: /Applications/Xcode.app/Contents/Developer

xcodebuild -version
# Should show Xcode version

xcrun --show-sdk-path --sdk iphoneos
# Should show the iOS SDK path
```

### **Step 3: Accept Xcode License (if needed)**

If you haven't accepted the Xcode license yet:

```bash
sudo xcodebuild -license accept
```

Or open Xcode manually and accept the license when prompted.

### **Step 4: Retry Pod Install**

Once the SDK is properly configured:

```bash
cd ios
pod install
```

## **Alternative: If Xcode is Not Installed**

If Xcode.app is not installed:

1. **Install Xcode from App Store** (it's free but large ~12GB)
2. **Or install Xcode Command Line Tools** (limited functionality):
   ```bash
   xcode-select --install
   ```
   Note: Command Line Tools alone may not be sufficient for React Native iOS development.

## **Troubleshooting**

### **If xcode-select command fails:**

1. Make sure Xcode.app exists in `/Applications/`
2. Check if Xcode is properly installed:
   ```bash
   ls -la /Applications/ | grep -i xcode
   ```

### **If SDK still not found:**

1. Open Xcode manually at least once
2. Let it complete any setup/updates
3. Accept the license agreement
4. Try the xcode-select command again

### **If you get permission errors:**

Make sure you have admin privileges on your Mac.

## **Quick Fix Script**

You can run these commands in sequence:

```bash
# Switch to Xcode
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# Verify
xcode-select -p
xcodebuild -version

# Accept license (if needed)
sudo xcodebuild -license accept

# Retry pod install
cd /Users/vizion/Documents/SALAH/ios
pod install
```

## **Status After Fix**

Once fixed, you should see:
- ✅ `xcode-select -p` shows `/Applications/Xcode.app/Contents/Developer`
- ✅ `xcodebuild -version` shows Xcode version
- ✅ `xcrun --show-sdk-path --sdk iphoneos` shows SDK path
- ✅ `pod install` completes successfully

---

**Note:** The boost library is already cached, so once the SDK issue is resolved, pod install should complete successfully.

