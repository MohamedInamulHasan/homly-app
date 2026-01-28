@echo off
echo ========================================
echo Initializing Git Repository
echo ========================================
cd /d D:\Homly-Fresh

echo.
echo Step 1: Initializing Git...
git init

echo.
echo Step 2: Adding all files...
git add .

echo.
echo Step 3: Creating initial commit...
git commit -m "Initial commit: Clean Homly app structure"

echo.
echo ========================================
echo Git repository initialized successfully!
echo ========================================
echo.
echo NEXT STEPS:
echo 1. Go to https://github.com/new
echo 2. Create a new repository (name it 'homly-app' or whatever you prefer)
echo 3. DO NOT initialize with README or .gitignore
echo 4. Copy the repository URL
echo 5. Run these commands:
echo.
echo    git remote add origin YOUR_REPO_URL
echo    git branch -M main
echo    git push -u origin main
echo.
echo ========================================
pause
