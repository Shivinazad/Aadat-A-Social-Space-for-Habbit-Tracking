# Quick Push Script - Run this to push all changes to GitHub

# Add all changes
Write-Host "📦 Adding all files..." -ForegroundColor Cyan
git add .

# Commit
Write-Host "💾 Committing changes..." -ForegroundColor Cyan
git commit -m "Production ready: PostgreSQL support, React build, Render deployment config"

# Push to GitHub
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan
git push origin main

Write-Host ""
Write-Host "✅ SUCCESS! Code pushed to GitHub" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 NEXT STEP: Open DEPLOY_NOW.md and follow the Render deployment steps" -ForegroundColor Yellow
Write-Host ""
Write-Host "Your repo: https://github.com/Shivinazad/Aadat-A-Social-Space-for-Habbit-Tracking" -ForegroundColor Cyan
