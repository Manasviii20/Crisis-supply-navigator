@echo off
echo 🚀 Pushing changes to GitHub...
echo.

echo 📦 Staging all files...
git add .
echo.

echo 💾 Committing changes...
git commit -m "Complete frontend overhaul with Bootstrap 5.3 - Added landing page, dashboard, supplies, shelters, deliveries - Integrated Chart.js and Leaflet.js maps - Custom CSS with animations and modern UI - Admin panel with full control features - Ready for Express.js backend integration"
echo.

echo 🔗 Setting up remote repository...
git remote add origin https://github.com/Manasviii20/Crisis-supply-navigator.git 2>nul
if %errorlevel% neq 0 (
    echo ℹ️  Remote already exists, continuing...
) else (
    echo ✅ Remote added successfully
)
echo.

echo 🌿 Switching to main branch...
git branch -M main
echo.

echo ⬆️  Pushing to GitHub...
git push -u origin main
echo.

echo ✨ Push complete!
echo.
echo 🌐 View your repository at:
echo https://github.com/Manasviii20/Crisis-supply-navigator
echo.
pause
