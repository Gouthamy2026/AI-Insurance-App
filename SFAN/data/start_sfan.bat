@echo off
echo ===================================================
echo   SFAN - Smart Financial Analysis Network Startup
echo ===================================================
echo.

:: Start Backend
echo [1/3] Starting Backend API (FastAPI)...
start "SFAN Backend" cmd /k "cd SFAN && backend\venv\Scripts\activate.bat && uvicorn backend.main:app --reload"

:: Start Frontend
echo [2/3] Starting Frontend Server (Port 8081)...
start "SFAN Frontend" cmd /k "cd SFAN\frontend && py -m http.server 8081"

:: Wait a few seconds for servers to start
echo [3/3] Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

:: Open the browser
echo Opening SFAN in your default web browser...

echo.
echo ===================================================
echo   DEFAULT ADMIN LOGIN
echo   Username: admin@sfan.com
echo   Password: admin123
echo ===================================================

start http://localhost:8081

echo.
echo SFAN is now running! Keep the two new command prompt windows open.
echo To stop the servers, simply close those windows.
echo ===================================================
pause
