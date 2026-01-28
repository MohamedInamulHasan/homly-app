# Build Android Debug APK (Signed Automatically)

## Quick Build - Debug APK

The debug APK is automatically signed by Android and can be installed immediately.

### Commands:

```bash
# 1. Navigate to project
cd "d:\Antigravity-Homly app"

# 2. Sync Capacitor
npx cap sync android

# 3. Build Debug APK (automatically signed)
cd android
.\gradlew assembleDebug
```

### APK Location:
`d:\Antigravity-Homly app\android\app\build\outputs\apk\debug\app-debug.apk`

### Install:
1. Uninstall old app from phone
2. Transfer `app-debug.apk` to phone
3. Install and run

---

## Alternative: Build Release APK (Requires Signing)

If you want a production release APK, you need to create a keystore first:

```bash
# Create keystore
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Then configure signing in android/app/build.gradle
```

**For now, use the DEBUG build above - it's simpler and works perfectly for testing!**
