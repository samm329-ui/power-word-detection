@echo off
title Power Word Detection
echo ============================================
echo    Power Word Detection - Auto Setup ^& Run
echo ============================================
echo.

REM --- Step 1: Check Python ---
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH.
    echo Download from https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)
echo [OK] Python found.
echo.

REM --- Step 2: Create venv if needed ---
if not exist venv\Scripts\python.exe (
    echo [1/5] Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment.
        echo.
        pause
        exit /b 1
    )
    echo      Done.
) else (
    echo [1/5] Virtual environment already exists.
)
echo.

REM --- Step 3: Install Python deps ---
echo [2/5] Checking Python dependencies...
venv\Scripts\pip.exe install -q -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies.
    echo.
    pause
    exit /b 1
)
echo      Done.
echo.

REM --- Step 4: Setup .env ---
if not exist .env (
    echo [3/5] Creating .env file...
    copy .env.template .env >nul
    echo      IMPORTANT: Edit .env with your GROQ_API_KEY
) else (
    echo [3/5] .env already exists.
)
echo.

REM --- Step 5: Check FFmpeg ---
echo [4/5] Checking FFmpeg...

REM Try to find ffmpeg.exe anywhere on the system
set "FFMPEG_EXE="
where ffmpeg >nul 2>&1 && for /f "delims=" %%i in ('where ffmpeg') do if not defined FFMPEG_EXE set "FFMPEG_EXE=%%i"

REM Also check .env
if not defined FFMPEG_EXE (
    for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
        if /i "%%a"=="FFMPEG_PATH" set "FFMPEG_EXE=%%b"
    )
    set "FFMPEG_EXE=%FFMPEG_EXE:"=%"
)

REM Also check common locations
if not defined FFMPEG_EXE if exist "C:\ffmpeg\ffmpeg.exe" set "FFMPEG_EXE=C:\ffmpeg\ffmpeg.exe"

REM Check if valid
if defined FFMPEG_EXE (
    if exist "%FFMPEG_EXE%" (
        echo      Found: %FFMPEG_EXE%
        REM Update .env
        powershell -NoProfile -Command "(Get-Content .env) -replace '^FFMPEG_PATH=.*','FFMPEG_PATH=%FFMPEG_EXE%' | Set-Content .env"
        goto :ffmpeg_ok
    )
)

REM Not found - need to download
echo      FFmpeg not found on this system.
echo      Attempting to install...
echo.

REM Method 1: Try winget
echo      Trying winget...
winget install --id Gyan.FFmpeg -e --accept-package-agreements --accept-source-agreements >nul 2>&1
if exist "C:\ffmpeg\ffmpeg.exe" (
    echo      Installed via winget.
    powershell -NoProfile -Command "(Get-Content .env) -replace '^FFMPEG_PATH=.*','FFMPEG_PATH=C:\ffmpeg\ffmpeg.exe' | Set-Content .env"
    goto :ffmpeg_ok
)

REM Method 2: Try direct download
echo      Trying direct download from gyan.dev...
echo      (This may take a few minutes, please wait...)
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; ^
    try { ^
        Write-Host 'Downloading...'; ^
        Invoke-WebRequest -Uri 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip' -OutFile '%TEMP%\ffmpeg.zip' -UseBasicParsing -ErrorAction Stop; ^
        Write-Host 'Extracting...'; ^
        if (-not (Test-Path 'C:\ffmpeg')) { New-Item 'C:\ffmpeg' -ItemType Directory | Out-Null }; ^
        Expand-Archive -Path '%TEMP%\ffmpeg.zip' -DestinationPath '%TEMP%\ffmpeg_extract' -Force; ^
        $inner = Get-ChildItem '%TEMP%\ffmpeg_extract' -Directory | Select-Object -First 1; ^
        if ($inner) { ^
            Get-ChildItem (Join-Path $inner.FullName 'bin') -Filter '*.exe' | ForEach-Object { Copy-Item $_.FullName 'C:\ffmpeg\' -Force }; ^
            Get-ChildItem (Join-Path $inner.FullName 'bin') -Filter '*.dll' | ForEach-Object { Copy-Item $_.FullName 'C:\ffmpeg\' -Force }; ^
        }; ^
        Remove-Item '%TEMP%\ffmpeg.zip' -Force -ErrorAction SilentlyContinue; ^
        Remove-Item '%TEMP%\ffmpeg_extract' -Recurse -Force -ErrorAction SilentlyContinue; ^
        Write-Host 'Done.' ^
    } catch { ^
        Write-Host ('Error: ' + $_.Exception.Message) ^
    }"

if exist "C:\ffmpeg\ffmpeg.exe" (
    echo      FFmpeg installed at C:\ffmpeg\ffmpeg.exe
    powershell -NoProfile -Command "(Get-Content .env) -replace '^FFMPEG_PATH=.*','FFMPEG_PATH=C:\ffmpeg\ffmpeg.exe' | Set-Content .env"
    goto :ffmpeg_ok
)

REM All methods failed
echo.
echo      ==========================================
echo      WARNING: Could not install FFmpeg.
echo      ==========================================
echo.
echo      Please install manually:
echo        1. Go to https://www.gyan.dev/ffmpeg/builds/
echo        2. Download "release essentials" build
echo        3. Extract to C:\ffmpeg
echo        4. Or edit .env and set FFMPEG_PATH
echo.
echo      The app will NOT work without FFmpeg.
echo.
pause
echo.

:ffmpeg_ok
echo.

REM --- Step 6: Install frontend deps ---
if not exist frontend\node_modules (
    echo [5/5] Installing frontend dependencies...
    cd frontend
    call npm install --silent
    if errorlevel 1 (
        echo ERROR: Failed to install frontend dependencies.
        cd ..
        echo.
        pause
        exit /b 1
    )
    cd ..
    echo      Done.
) else (
    echo [5/5] Frontend dependencies already installed.
)
echo.

REM --- Step 7: Launch servers ---
echo ============================================
echo    Starting servers...
echo ============================================
echo.

start "Backend" cmd /k "venv\Scripts\python.exe -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"
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
