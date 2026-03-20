@echo off
echo Starting Homly Dev Environment...

echo Starting Backend...
start "Homly Backend" cmd /k "cd backend && npm run dev"

echo Starting Frontend...
start "Homly Frontend" cmd /k "npm run dev -- --port 5173"

echo Done! Windows should open for both services.
echo If Backend fails to connect to MongoDB, please check your IP Whitelist on Atlas.
pause
