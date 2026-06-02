@echo off
title Power Word Detection
echo ============================================
echo    Power Word Detection - Starting...
echo ============================================
echo.

REM --- Check Python ---
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found.
    echo Please install Python from: https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b 1
)
echo [OK] Python found.

REM --- Check Node.js ---
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found.
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found.

REM --- Check venv ---
if not exist venv\Scripts\python.exe (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment.
        pause
        exit /b 1
    )
)
echo [OK] Virtual environment ready.

REM --- Install Python dependencies ---
echo Installing Python dependencies...
venv\Scripts\pip.exe install -q -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies.
    pause
    exit /b 1
)
echo [OK] Python dependencies installed.

REM --- Check FFmpeg ---
where ffmpeg >nul 2>&1
if errorlevel 1 (
    echo WARNING: FFmpeg not found. Video processing may not work.
    echo Please install from: https://ffmpeg.org/download.html
) else (
    echo [OK] FFmpeg found.
)
echo.

REM --- Install frontend dependencies ---
if not exist frontend\node_modules (
    echo Installing frontend dependencies...
    cd frontend
    call npm install --silent
    cd ..
    echo [OK] Frontend dependencies installed.
) else (
    echo [OK] Frontend dependencies ready.
)
echo.

REM --- Launch servers ---
echo ============================================
echo    Starting servers...
echo ============================================
echo.

start "Backend" cmd /k "venv\Scripts\python.exe -m uvicorn backend.main:app --reload --reload-dir backend --reload-dir caption_engine --host 0.0.0.0 --port 8000"
timeout /t 3 /nobreak >nul
start "Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo    Backend:  http://localhost:8000
echo    Frontend: http://localhost:3000
echo.
echo    Open http://localhost:3000 in your browser.
echo    Close this window when done.
echo.
pause
