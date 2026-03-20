# How to Debug the Android App

## The app is blank - here's how to see what's wrong:

### Step 1: Connect Phone to Computer via USB

### Step 2: Enable USB Debugging on Phone
1. Go to Settings → About Phone
2. Tap "Build Number" 7 times (enables Developer Options)
3. Go back → Developer Options
4. Enable "USB Debugging"

### Step 3: Open Chrome DevTools
1. **On your computer**, open Google Chrome
2. Go to: `chrome://inspect`
3. You should see your phone listed
4. Find "Homly" app in the list
5. Click **"inspect"**

### Step 4: Look at Console
A DevTools window opens. Click the **"Console"** tab.

You should see messages like:
```
🔗 API Base URL: https://homly-backend-8616.onrender.com/api
🔄 Starting to fetch products...
📡 Calling API: getProducts...
```

### What to Look For:

**If you see:**
- ✅ `✅ Loaded X products` → It's working!
- ❌ `❌ Failed to fetch` → API call failed
- ❌ `CORS error` → Backend CORS issue
- ❌ `Network error` → Internet/connection issue
- ❌ Nothing at all → App crashed before loading

### Step 5: Share the Error
Take a screenshot of the Console tab and show me what errors you see.

---

## Quick Test Without DevTools

If you can't use Chrome DevTools, try this:

1. Open the app
2. Wait 10 seconds
3. Does ANYTHING show up? (categories, slider, etc.)
4. Or is it completely blank?

Let me know what you see!
