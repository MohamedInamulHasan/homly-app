# Fix: Products Not Loading in Android App

## The Problem

The Android app can't load products because it's trying to connect to `http://localhost:5000/api`, which doesn't work on a mobile device. Localhost on a phone refers to the phone itself, not your computer.

## Solution: Configure Your Backend URL

### Step 1: Find Your Backend URL

Your backend is deployed on Render. Find your backend URL:
1. Go to https://render.com
2. Find your backend service
3. Copy the URL (it looks like: `https://your-app-name.onrender.com`)

### Step 2: Create .env File

Create a file called `.env` (no extension, just `.env`) in your project root:

**Location:** `d:\Antigravity-Homly app\.env`

**Contents:**
```
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
```

**Replace `your-backend-url.onrender.com` with your actual Render backend URL!**

**Example:**
```
VITE_API_BASE_URL=https://homly-backend-abc123.onrender.com/api
```

### Step 3: Rebuild Everything

After creating the `.env` file, run these commands:

```powershell
# 1. Rebuild web app with new API URL
npm run build

# 2. Sync with Android
npx cap sync android

# 3. Rebuild APK in Android Studio
# Build → Generate App Bundles or APKs → Build APK(s)
```

### Step 4: Install New APK

1. Uninstall old app from phone
2. Install new APK
3. Products should load now!

---

## What I Already Fixed

✅ Added network permissions to AndroidManifest.xml
✅ Created network security config to allow HTTP/HTTPS
✅ Configured cleartext traffic support

## What You Need to Do

1. ⚠️ Create `.env` file with your Render backend URL
2. ⚠️ Rebuild: `npm run build`
3. ⚠️ Sync: `npx cap sync android`
4. ⚠️ Build new APK in Android Studio
5. ⚠️ Install on phone

---

## Quick Commands

```powershell
# After creating .env file:
cd "d:\Antigravity-Homly app"
npm run build
npx cap sync android
# Then build APK in Android Studio
```

---

## Need Help Finding Your Backend URL?

Check these places:
- Render dashboard: https://dashboard.render.com
- Your backend deployment logs
- The URL you use when testing in browser

The URL should end with `.onrender.com`
