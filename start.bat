@echo off
title AI Engineer Roadmap & Learning Hub
cls
echo ======================================================================
echo    Starting AI Engineer Roadmap & Learning Hub (Local Web Server)
echo ======================================================================
echo.
echo Opening browser at http://localhost:8000/index.html ...
echo.
echo Press Ctrl+C in this window to stop the server anytime.
echo.
start "" "http://localhost:8000/index.html"
python -m http.server 8000
if %errorlevel% neq 0 (
    echo.
    echo [NOTICE] Python http.server stopped or python was not found in PATH.
    pause
)
