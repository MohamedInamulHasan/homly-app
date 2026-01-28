# MongoDB Setup Script for Homly E-commerce Backend

Write-Host "=== MongoDB Atlas Connection Setup ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will help you configure your MongoDB Atlas connection."
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host ".env file not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

Write-Host "Please provide your MongoDB Atlas connection details:" -ForegroundColor Green
Write-Host ""

# Get MongoDB connection string
Write-Host "Enter your MongoDB Atlas connection string:" -ForegroundColor Yellow
Write-Host "(Format: mongodb+srv://username:password@cluster.mongodb.net/database)" -ForegroundColor Gray
$mongoUri = Read-Host "MongoDB URI"

if ([string]::IsNullOrWhiteSpace($mongoUri)) {
    Write-Host "Error: MongoDB URI cannot be empty!" -ForegroundColor Red
    exit 1
}

# Read current .env file
$envContent = Get-Content ".env" -Raw

# Update or add MONGODB_URI
if ($envContent -match "MONGODB_URI=.*") {
    $envContent = $envContent -replace "MONGODB_URI=.*", "MONGODB_URI=$mongoUri"
} else {
    $envContent += "`nMONGODB_URI=$mongoUri"
}

# Write back to .env file
Set-Content ".env" $envContent

Write-Host ""
Write-Host "✓ MongoDB connection string updated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your backend server (Ctrl+C then 'npm start')" -ForegroundColor White
Write-Host "2. Check the console for 'MongoDB Connected' message" -ForegroundColor White
Write-Host ""
