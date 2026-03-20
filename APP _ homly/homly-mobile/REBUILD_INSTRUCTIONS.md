# Rebuild Android APK with Geolocation Plugin

## What Changed
I've installed the **Capacitor Geolocation plugin** which enables native Android location permission dialogs. This fixes the issue where clicking "Use Current Location" immediately timed out without showing a permission prompt.

## How to Rebuild the APK

### Option 1: Using the Build Script (Recommended)
```powershell
cd "C:\Users\moham\APP _ homly\homly-mobile"
.\build_app.bat
```

The APK will be created at:
```
C:\Users\moham\APP _ homly\homly-mobile\android\app\build\outputs\apk\debug\app-debug.apk
```

### Option 2: Using Android Studio
1. Open Android Studio
2. Open the project: `C:\Users\moham\APP _ homly\homly-mobile\android`
3. Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
4. Wait for the build to complete
5. Click "locate" in the notification to find the APK

### Option 3: Using Gradle Command Line
```powershell
cd "C:\Users\moham\APP _ homly\homly-mobile\android"
.\gradlew assembleDebug
```

## Testing the Fix
1. **Uninstall** the old Homly app from your Android device
2. Install the new APK
3. Open the app and navigate to Checkout or Services
4. Click "Use Current Location"
5. **Expected**: You should now see the Android system dialog:
   > **"Allow Homly to access this device's location?"**
   > [While using the app] [Only this time] [Don't allow]
6. Select "While using the app" or "Only this time"
7. The location should be captured successfully

## What This Plugin Does
- Bridges the web `navigator.geolocation` API to native Android location services
- Automatically requests runtime permissions when needed
- Handles permission denials gracefully
- Works with both GPS and network-based location

## Note
The web version on Vercel doesn't need this plugin—it works directly with browser permissions. This is only required for the Android WebView wrapper.
