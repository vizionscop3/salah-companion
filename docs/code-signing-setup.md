# **Code Signing Setup Guide**

## **Why Code Signing is Required**

iOS requires code signing to:
- Verify app authenticity
- Enable installation on devices
- Allow app capabilities (notifications, location, etc.)

## **Quick Setup in Xcode**

### **Step 1: Open Workspace**
```bash
open ios/SalahCompanion.xcworkspace
```

### **Step 2: Configure Signing**

1. **Select Project:**
   - Click "SalahCompanion" in Project Navigator (left sidebar)

2. **Select Target:**
   - Under "TARGETS", click "SalahCompanion"

3. **Go to Signing & Capabilities:**
   - Click the "Signing & Capabilities" tab at the top

4. **Enable Automatic Signing:**
   - ✅ Check **"Automatically manage signing"**

5. **Select Team:**
   - Click the **Team** dropdown
   - Select your Apple ID/Team
     - If you don't see a team:
       - Click "Add an Account..."
       - Sign in with your Apple ID
       - Free "Personal Team" will be created automatically

6. **Bundle Identifier:**
   - Should be: `org.reactjs.native.example.SalahCompanion`
   - If there's a conflict, change it to something unique like:
     - `com.yourname.salahcompanion`

### **Step 3: For Physical Device**

1. **Connect iPhone 12:**
   - Connect via USB
   - Trust computer when prompted on iPhone

2. **Select Device:**
   - In Xcode, select "Lee's iPhone" from device dropdown

3. **Build and Run:**
   - Press `Cmd + R`
   - First build may take a few minutes
   - App will install and launch on your device

### **Step 4: Trust Developer on iPhone**

After first install:
1. On iPhone: Settings → General → VPN & Device Management
2. Tap your Apple ID under "Developer App"
3. Tap "Trust [Your Apple ID]"
4. Confirm trust
5. App will now launch

## **Troubleshooting**

### **"No accounts with Apple ID"**

1. Xcode → Preferences → Accounts
2. Click "+" → Add Apple ID
3. Sign in with your Apple ID
4. Free Personal Team will be created

### **"Bundle identifier is already in use"**

Change the bundle identifier:
1. In Signing & Capabilities
2. Change Bundle Identifier to something unique:
   - `com.yourname.salahcompanion`
   - `com.yourdomain.salahcompanion`

### **"Provisioning profile doesn't match"**

1. Uncheck "Automatically manage signing"
2. Check it again
3. Select your team
4. Xcode will regenerate the profile

### **"Code signing is required"**

- Make sure "Automatically manage signing" is checked
- Select a team from the dropdown
- If no team, add your Apple ID in Xcode Preferences

## **Free vs Paid Developer Account**

- **Free (Personal Team):**
  - ✅ Works for development and testing
  - ✅ Can install on your own devices
  - ⚠️ Apps expire after 7 days (need to rebuild)
  - ❌ Cannot distribute to App Store

- **Paid ($99/year):**
  - ✅ All free features
  - ✅ Apps don't expire
  - ✅ Can distribute to App Store
  - ✅ TestFlight beta testing

**For development and testing, free Personal Team is sufficient!**

## **Verification**

After setting up code signing:
- ✅ No code signing errors in Xcode
- ✅ Build succeeds
- ✅ App installs on device/simulator
- ✅ App launches successfully

---

**Once code signing is configured, the build should succeed!** 🎉

