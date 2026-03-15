# Git Push Script for Windows PowerShell
# Run this script to push your changes to GitHub

Write-Host "🚀 Pushing changes to GitHub..." -ForegroundColor Green

# Stage all changes
Write-Host "`n📦 Staging files..." -ForegroundColor Yellow
git add .

# Commit with message
Write-Host "`n💾 Committing changes..." -ForegroundColor Yellow
git commit -m "Complete frontend overhaul with Bootstrap 5.3

- Added landing page, dashboard, supplies, shelters, deliveries pages
- Integrated Chart.js and Leaflet.js maps
- Custom CSS with animations and modern UI
- Admin panel with full control features
- Ready for Express.js backend integration"

# Check if remote exists
Write-Host "`n🔗 Checking remote repository..." -ForegroundColor Yellow
$remoteExists = git remote get-url origin 2>$null

if ($remoteExists) {
    Write-Host "✅ Remote found: $remoteExists" -ForegroundColor Green
} else {
    Write-Host "⚠️  No remote configured. Adding remote..." -ForegroundColor Yellow
    git remote add origin https://github.com/Manasviii20/Crisis-supply-navigator.git
}

# Set upstream and push
Write-Host "`n⬆️  Pushing to GitHub..." -ForegroundColor Yellow
git branch -M main
git push -u origin main

Write-Host "`n✨ Push complete!" -ForegroundColor Green
Write-Host "`n🌐 View your repository at:" -ForegroundColor Cyan
Write-Host "https://github.com/Manasviii20/Crisis-supply-navigator" -ForegroundColor White
