@echo off
echo 🔄 Syncing Capacitor Config...
cd /d "%~dp0"
call npx cap sync android

echo 🏗️ Building Android APK...
cd android
echo.
echo NOTE: If this fails with JAVA_HOME error, please open this project in Android Studio.
echo Project Path: %~dp0android
echo.
call gradlew assembleDebug

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Build Failed. Please open Android Studio and build from there.
    echo Command to open: npx cap open android
    pause
    exit /b %ERRORLEVEL%
)

echo 📦 Copying APK to root...
copy "app\build\outputs\apk\debug\app-debug.apk" "..\homly-debug.apk"

echo ✅ Build Complete! APK is at %~dp0homly-debug.apk
pause
