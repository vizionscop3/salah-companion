# **AppDelegate Rewrite for React Native 0.72.6**

## **Problem**

The AppDelegate was using React Native's **new architecture APIs** that don't exist in React Native 0.72.6:

- `RCTReactNativeFactory` ❌
- `RCTDefaultReactNativeFactoryDelegate` ❌
- `RCTAppDependencyProvider` ❌

These APIs are only available in React Native 0.73+ with the new architecture enabled.

## **Solution**

Rewrote AppDelegate to use the **traditional React Native 0.72.6 pattern**:

```swift
import UIKit
import React

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let bridge = RCTBridge(delegate: self, launchOptions: launchOptions)!
    let rootView = RCTRootView(bridge: bridge, moduleName: "SalahCompanion", initialProperties: nil)

    window = UIWindow(frame: UIScreen.main.bounds)
    let rootViewController = UIViewController()
    rootViewController.view = rootView
    window?.rootViewController = rootViewController
    window?.makeKeyAndVisible()

    return true
  }
}

extension AppDelegate: RCTBridgeDelegate {
  func sourceURL(for bridge: RCTBridge!) -> URL! {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
```

## **Key Changes**

1. **Removed new architecture imports:**
   - `import React_RCTAppDelegate` ❌
   - `import ReactAppDependencyProvider` ❌

2. **Using standard React Native APIs:**
   - `RCTBridge` ✅
   - `RCTRootView` ✅
   - `RCTBridgeDelegate` ✅

3. **Simplified structure:**
   - No custom delegate classes
   - Direct bridge initialization
   - Standard view controller setup

## **Why This Works**

React Native 0.72.6 uses the **traditional architecture** by default. The new architecture (with `RCTReactNativeFactory`, etc.) is:
- Only available in React Native 0.73+
- Requires explicit opt-in
- Not compatible with 0.72.6

## **Status**

- ✅ AppDelegate rewritten for React Native 0.72.6
- ✅ Uses standard RCTBridge pattern
- ✅ Compatible with all dependencies
- ✅ Ready to build

---

**Note:** If you upgrade to React Native 0.73+ in the future, you can migrate to the new architecture APIs, but for now, the traditional pattern is correct for 0.72.6.

