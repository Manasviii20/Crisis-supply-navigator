@echo off
cd /d c:\Users\manas\Crisis-supply-navigator
echo Pushing to GitHub...
git add .
git commit -m "Add backend implementation"
git push origin main --force
echo Done!
pause
