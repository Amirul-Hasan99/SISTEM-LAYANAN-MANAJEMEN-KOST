@echo off
cd /d "%~dp0"
echo Starting KostHub Backend and Frontend locally...

echo Starting Backend...
start "Backend" cmd /k "npm run dev:backend"

echo Starting Frontend...
start "Frontend" cmd /k "npm run dev:frontend"

echo Both servers are starting in separate windows.
pause
