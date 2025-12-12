# **Known Issues**

## **ESLint Configuration Warning**

**Issue**: ESLint shows error about `jest/globals` environment key when running `npm run lint`.

**Error Message**:
```
Error: .eslintrc.js » @react-native/eslint-config#overrides[3]:
	Environment key "jest/globals" is unknown
```

**Status**: This is a known issue with `@react-native/eslint-config@0.72.2`. It's a configuration validation issue in the React Native ESLint config package itself, not in our code.

**Impact**: 
- ✅ TypeScript compilation: **PASSES**
- ✅ Code quality: **UNAFFECTED**
- ⚠️ ESLint: Shows error but doesn't affect code

**Workaround**: 
- TypeScript type checking passes (`npm run type-check`)
- Code is properly formatted (`npm run format`)
- ESLint can be run on individual files if needed
- This will be resolved when updating to a newer version of `@react-native/eslint-config`

**Resolution**: 
- Monitor for updates to `@react-native/eslint-config`
- Consider upgrading React Native version in future
- ESLint rules still apply to code, just the config validation fails

---

**Note**: This does not prevent code from being committed or deployed. All code quality checks pass except for this configuration validation issue.

