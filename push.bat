@echo off
echo ==========================================
echo  KostHub - Push to GitHub
echo  Repo: Amirul-Hasan99/SISTEM-LAYANAN-MANAJEMEN-KOST
echo ==========================================
echo.

if not exist .git (
    echo Initializing Git repository...
    git init
    echo.
)

set /p msg="Enter commit message (press Enter to use default 'Update'): "
if "%msg%"=="" set msg="Update"

echo.
echo Adding files to staging...
git add .

echo.
echo Committing changes...
git commit -m "%msg%"

echo.
echo Configuring remote repository...
git remote add origin https://github.com/Amirul-Hasan99/SISTEM-LAYANAN-MANAJEMEN-KOST.git 2>nul
git remote set-url origin https://github.com/Amirul-Hasan99/SISTEM-LAYANAN-MANAJEMEN-KOST.git

echo.
echo Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo Done!
pause
