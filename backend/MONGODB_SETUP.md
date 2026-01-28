# MongoDB Atlas Setup Guide

## Quick Setup

### Option 1: Use the Setup Script (Easiest)

1. Open PowerShell in the backend directory:
   ```powershell
   cd "d:\Antigravity-Homly app\backend"
   ```

2. Run the setup script:
   ```powershell
   .\setup-mongodb.ps1
   ```

3. When prompted, paste your MongoDB Atlas connection string

4. Restart the backend server

### Option 2: Manual Setup

1. **Get your MongoDB Atlas connection string:**
   - Go to https://cloud.mongodb.com/
   - Log in to your MongoDB Atlas account
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Select "Node.js" as the driver
   - Copy the connection string

2. **Update the .env file:**
   - Open `d:\Antigravity-Homly app\backend\.env` in a text editor
   - Find the line: `MONGODB_URI=...`
   - Replace it with your connection string:
     ```
     MONGODB_URI=mongodb+srv://yourusername:yourpassword@yourcluster.mongodb.net/homly-ecommerce?retryWrites=true&w=majority
     ```
   - **Important:** Replace:
     - `yourusername` with your MongoDB Atlas username
     - `yourpassword` with your MongoDB Atlas password
     - `yourcluster` with your cluster name
     - `homly-ecommerce` with your database name

3. **Save the file**

4. **Restart the backend server:**
   - Press `Ctrl+C` in the terminal running the backend
   - Run: `npm start`
   - Look for: `MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net`

## Troubleshooting

### Connection Timeout Errors

If you see `MongoNetworkTimeoutError`:
- Check that your IP address is whitelisted in MongoDB Atlas
- Go to Network Access in MongoDB Atlas
- Add your current IP or use `0.0.0.0/0` for all IPs (development only)

### Authentication Failed

If you see authentication errors:
- Verify your username and password are correct
- Make sure special characters in the password are URL-encoded
- Example: `p@ssw0rd` should be `p%40ssw0rd`

### Database Not Found

- The database will be created automatically when you first add data
- Make sure the database name in the connection string matches what you want

## Testing the Connection

After restarting the backend, you should see:
```
Server running in development mode on port 5000
MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
```

Then refresh http://localhost:5173 and products should appear!
