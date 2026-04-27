@echo off
cd /d "%~dp0"
echo 🚀 Preparing to Push Changes...

git add .
git commit -m "Fix: Address update flow & Premium UI Revamp (Editorial News + Store-style Services)"
git push

echo ✅ Successfully pushed to GitHub!
pause
