# Vercel Deployment Guide

## Issue
Login works on localhost but fails on Vercel deployment.

## Root Cause
The frontend API was hardcoded to `http://localhost:5000/api`, which doesn't work when deployed to Vercel.

## Solution

### 1. Updated API Configuration
Modified `src/utils/api.js` to use environment variables:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
```

### 2. Configure Vercel Environment Variables

You need to set the backend API URL in your Vercel project settings:

#### Steps:
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: Your deployed backend URL (e.g., `https://your-backend.onrender.com/api`)
   - **Environment**: Production, Preview, Development (select all)

#### Where is your backend deployed?
You need to provide your backend API URL. Common options:

**Option A: Backend on Render.com**
- URL format: `https://your-app-name.onrender.com/api`
- Example: `https://homly-backend.onrender.com/api`

**Option B: Backend on Railway.app**
- URL format: `https://your-app-name.up.railway.app/api`

**Option C: Backend on Heroku**
- URL format: `https://your-app-name.herokuapp.com/api`

**Option D: Backend on Vercel (Serverless)**
- URL format: `https://your-backend.vercel.app/api`

### 3. Backend CORS Configuration

Your backend already allows Vercel apps (line 40 in `backend/src/server.js`):

```javascript
if (origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
    return callback(null, true);
}
```

This means any `*.vercel.app` domain is allowed.

### 4. Redeploy to Vercel

After setting the environment variable:

1. **Automatic**: Vercel will automatically redeploy when you push to GitHub
2. **Manual**: Go to Vercel dashboard → Deployments → Redeploy

### 5. Local Development

For local development, create a `.env` file (already in `.gitignore`):

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

Or just use the default (no `.env` file needed for localhost).

## Verification

After deployment, test the login:
1. Go to your Vercel app URL
2. Navigate to `/login`
3. Enter credentials
4. Should successfully log in without network errors

## Troubleshooting

### Still getting CORS errors?
- Check backend logs to see which origin is being blocked
- Verify `VITE_API_BASE_URL` is set correctly in Vercel
- Ensure backend is deployed and accessible

### Network timeout?
- Backend might be on free tier and needs time to wake up
- Wait 30-60 seconds and try again
- Check backend deployment status

### 401 Unauthorized?
- This is actually good - means CORS is working
- Check your credentials are correct
- Verify user exists in database

## Next Steps

1. **Deploy your backend** (if not already deployed)
2. **Set `VITE_API_BASE_URL`** in Vercel environment variables
3. **Redeploy** your Vercel app
4. **Test** the login functionality

---

**Need Help?**
- Check backend deployment logs
- Verify environment variables are set
- Test backend API directly: `https://your-backend-url/api/users/login`
