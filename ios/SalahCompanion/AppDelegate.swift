import UIKit
import React

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?
  var bridge: RCTBridge?
  var rootViewController: UIViewController?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // CRITICAL FIX: Use direct bundle URL initialization to avoid error handling path
    // This prevents the RCTMessageThread destructor crash by bypassing bridge delegate error handling
    
    // Get bundle URL directly (prioritize local bundle)
    let bundleURL = getBundleURL()
    
    guard let url = bundleURL else {
      fatalError("Failed to get bundle URL - ensure main.jsbundle exists in app bundle")
    }
    
    print("✅ Using bundle URL: \(url)")
    
    // Initialize bridge with direct URL (avoids delegate error handling)
    // This prevents the crash by not triggering the error handling path
    let bridge = RCTBridge(bundleURL: url, moduleProvider: nil, launchOptions: launchOptions)
    
    // Store bridge reference to keep it alive
    self.bridge = bridge

    // Create root view with the bridge
    let rootView = RCTRootView(bridge: bridge!, moduleName: "SalahCompanion", initialProperties: nil)

    if #available(iOS 13.0, *) {
      rootView.backgroundColor = UIColor.systemBackground
    } else {
      rootView.backgroundColor = UIColor.white
    }

    window = UIWindow(frame: UIScreen.main.bounds)
    let viewController = UIViewController()
    viewController.view = rootView
    // Store view controller reference to keep bridge alive
    self.rootViewController = viewController
    window?.rootViewController = viewController
    window?.makeKeyAndVisible()

    return true
  }
  
  // Get bundle URL directly (bypasses delegate pattern to avoid error handling)
  private func getBundleURL() -> URL? {
#if DEBUG
    // Priority 1: Local bundle (most reliable, prevents Metro connection errors)
    if let localBundle = Bundle.main.url(forResource: "main", withExtension: "jsbundle") {
      return localBundle
    }
    
    // Priority 2: Metro bundler (only if local bundle not found)
    let bundleURLProvider = RCTBundleURLProvider.sharedSettings()
    if let url = bundleURLProvider.jsBundleURL(forBundleRoot: "index") {
      return url
    }
    
    // Priority 3: Manual localhost fallback (last resort)
    return URL(string: "http://localhost:8081/index.bundle?platform=ios&dev=true")
#else
    // Production: use bundled JavaScript
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
