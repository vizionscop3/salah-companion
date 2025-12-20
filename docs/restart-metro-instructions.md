# Restart Metro with New Config

## Steps to Apply Crypto Fix

1. **Stop current Metro bundler**:
   - In the terminal where Metro is running, press `Ctrl+C`

2. **Clear Metro cache and restart**:
   ```bash
   npx react-native start --reset-cache
   ```

3. **Wait for Metro to start**:
   - Should see "Metro waiting on port 8081"
   - Should see bundle building messages

4. **Test bundle**:
   ```bash
   curl -s 'http://localhost:8081/index.bundle?platform=android' | head -5
   ```
   - Should return JavaScript code (not error JSON)

5. **Reload app**:
   - Press `r` in Metro terminal
   - OR shake device → "Reload"

---

## If Still Failing

If crypto still can't be resolved, we may need to:
1. Use a different bcrypt library (React Native compatible)
2. Move password hashing to backend API
3. Use a different authentication approach

---

*Last Updated: December 18, 2025*
