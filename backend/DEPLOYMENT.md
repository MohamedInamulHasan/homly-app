# Homly Backend - Deployment Guide

This guide will help you deploy the Homly backend to **Render** (recommended free hosting).

## Prerequisites

1. A MongoDB Atlas account (free tier available)
2. A Render account (free tier available)
3. Your code pushed to GitHub

---

## Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with password
4. Whitelist all IP addresses (0.0.0.0/0) for development
5. Get your connection string (replace `<password>` with your actual password)

---

## Step 2: Deploy to Render

### Option A: Using Render Dashboard (Easiest)

1. **Push your code to GitHub** (if not already done)

2. **Go to [Render](https://render.com)** and sign up/login

3. **Create a New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your backend

4. **Configure the service:**
   - **Name:** `homly-backend` (or your preferred name)
   - **Region:** Choose closest to your users
   - **Branch:** `main` (or your default branch)
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

5. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable"
   
   Add these variables:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_connection_string
   PORT=5000
   CLIENT_URL=your_frontend_url
   ```

6. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Your backend will be live at: `https://your-service-name.onrender.com`

---

## Step 3: Update Frontend

Update your frontend's `.env` file:

```env
VITE_API_BASE_URL=https://your-service-name.onrender.com/api
```

---

## Alternative: Deploy to Railway

1. Go to [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables (same as above)
5. Railway will auto-detect and deploy your Node.js app

---

## Alternative: Deploy to Vercel (Serverless)

**Note:** Requires slight modifications for serverless deployment.

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your backend directory
3. Follow the prompts
4. Add environment variables in Vercel dashboard

---

## Testing Your Deployment

Once deployed, test your API:

```bash
# Test health endpoint
curl https://your-service-name.onrender.com/

# Test products endpoint
curl https://your-service-name.onrender.com/api/products
```

---

## Important Notes

### Free Tier Limitations

- **Render Free Tier:**
  - Spins down after 15 minutes of inactivity
  - First request after spin-down takes ~30 seconds
  - 750 hours/month free

- **MongoDB Atlas Free Tier:**
  - 512 MB storage
  - Shared cluster
  - Perfect for development/small apps

### Keeping Your App Awake

To prevent Render from spinning down, you can:

1. Use a service like [UptimeRobot](https://uptimerobot.com) to ping your API every 10 minutes
2. Upgrade to a paid plan ($7/month) for always-on service

---

## Troubleshooting

### Deployment Fails
- Check build logs in Render dashboard
- Verify all environment variables are set
- Ensure `package.json` has correct start script

### Database Connection Issues
- Verify MongoDB connection string
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

### CORS Errors
- Verify `CLIENT_URL` environment variable matches your frontend URL
- Check CORS configuration in `server.js`

---

## Next Steps

After deployment:
1. Update frontend with new API URL
2. Test all endpoints
3. Monitor logs in Render dashboard
4. Set up custom domain (optional)

---

## Support

If you encounter issues:
- Check Render logs: Dashboard → Your Service → Logs
- MongoDB Atlas logs: Atlas Dashboard → Monitoring
- Verify environment variables are correctly set
