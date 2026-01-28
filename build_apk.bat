@echo off
echo 🔄 Syncing Capacitor Config...
cd /d "d:\Antigravity-Homly app"
call npx cap sync android

echo 🏗️ Building Android APK...
cd android
call gradlew assembleDebug

echo 📦 Copying APK to root...
copy "app\build\outputs\apk\debug\app-debug.apk" "..\homly-debug.apk"

echo ✅ Build Complete! APK is at d:\Antigravity-Homly app\homly-debug.apk
pause
