@echo off
cd /d "%~dp0"
echo 🚀 Starting Build Process...

echo 🏗️ Building Web App...
call npm run build

echo 🔄 Syncing Capacitor Android Project...
call npx cap sync android

echo 🏗️ Building Android APK (Debug)...
cd android
call gradlew assembleDebug

echo 📦 Finalizing APK...
cd ..
if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    copy "android\app\build\outputs\apk\debug\app-debug.apk" "homly-debug.apk" /Y
    echo ✅ Build Complete! Your APK is ready: homly-debug.apk
) else (
    echo ❌ Error: APK build failed. Check android/build_log.txt for details.
)

pause
