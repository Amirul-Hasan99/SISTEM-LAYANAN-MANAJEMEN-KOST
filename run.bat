@echo off
cd /d "%~dp0"
echo Starting KostHub Backend and Frontend locally...

echo Starting Backend...
start "KostHub Backend" cmd /k "go run main.go"

echo Starting Frontend...
start "KostHub Frontend" cmd /k "cd frontend && npm run dev"

echo Both servers are starting in separate windows.
pause
