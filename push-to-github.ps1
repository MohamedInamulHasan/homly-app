# Quick Setup Script
# Run this after creating your GitHub repository

# Replace YOUR_REPO_URL with your actual GitHub repository URL
# Example: https://github.com/yourusername/homly-app.git

$repoUrl = Read-Host "Enter your GitHub repository URL"

Write-Host "`nConnecting to GitHub..." -ForegroundColor Cyan
git remote add origin $repoUrl
git branch -M main
git push -u origin main

Write-Host "`nDone! Your code is now on GitHub!" -ForegroundColor Green
Write-Host "Next: Connect this repo to Vercel" -ForegroundColor Yellow
