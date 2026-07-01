@echo off
echo ==========================================
echo Starting SFAN (Smart Financial Analysis Network)
echo ==========================================

echo [1/3] Starting Python Backend Server...
start "SFAN Backend" cmd /k "backend\venv\Scripts\activate.bat && uvicorn backend.main:app --reload"

echo [2/3] Starting Frontend Server...
start "SFAN Frontend" cmd /k "cd frontend && python -m http.server 8080"

echo [3/3] Waiting for servers to initialize...
timeout /t 3 >nul

echo Opening SFAN in your default web browser...
start http://localhost:8080/index.html

echo.
echo All services have been started!
echo You can close this window now. The servers are running in the new windows.
pause
