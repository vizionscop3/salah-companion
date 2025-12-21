# iOS Sandbox & Hermes Framework Permission Fixes

## Issues

### 1. Sandbox Permission Errors
```
Sandbox: rsync(11632) deny(1) file-read-data
Sandbox: rsync(11633) deny(1) file-write-create
```

### 2. Hermes Framework Errors
```
mkstempat: 'hermes.framework/.hermes.QL7TDhDWyy': Operation not permitted
hermes.framework/hermes: utimensat (2): No such file or directory
```

## Root Cause

These errors are caused by:
- macOS sandbox restrictions preventing Xcode from accessing DerivedData
- Corrupted or locked files in DerivedData
- File permission issues with Hermes framework
- Xcode cache corruption

## Solutions Applied

### 1. Clean DerivedData
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/SalahCompanion-*
```

### 2. Clean Xcode Build
```bash
cd ios
xcodebuild clean -workspace SalahCompanion.xcworkspace -scheme SalahCompanion
```

### 3. Clean Pods Build Artifacts
```bash
cd ios
rm -rf Pods/build
```

### 4. Fix Podfile Syntax Error
**Issue**: Invalid regex flag `/g` in Ruby (Ruby's `gsub` is global by default)

**Fix**: Removed `/g` flag from regex pattern:
```ruby
# Before (incorrect):
patched_content.gsub(/\(std::size_t\)/g, '(::std::size_t)')

# After (correct):
patched_content.gsub(/\(std::size_t\)/, '(::std::size_t)')
```

### 5. Reinstall Pods
```bash
cd ios
pod deintegrate
pod install --repo-update
```

### 6. Fix Hermes Framework Permissions
```bash
cd ios
chmod -R u+w Pods/hermes-engine
```

## Additional Steps if Issues Persist

1. **Close and Reopen Xcode**:
   - Quit Xcode completely (Cmd+Q)
   - Reopen the project

2. **Clean Build Folder in Xcode**:
   - Product > Clean Build Folder (Shift+Cmd+K)

3. **Restart Mac** (if sandbox issues persist):
   - Sometimes macOS sandbox restrictions require a system restart

4. **Check File Permissions**:
   ```bash
   cd ios
   ls -la Pods/hermes-engine
   ```

5. **Verify DerivedData is Clean**:
   ```bash
   ls -la ~/Library/Developer/Xcode/DerivedData/ | grep SalahCompanion
   ```
   Should return nothing if clean.

## Prevention

- Always clean DerivedData when switching branches or after major dependency updates
- Use `pod install` instead of `pod update` when possible
- Keep Xcode updated to latest stable version
- Avoid manually editing files in `Pods/` directory (use Podfile patches instead)
