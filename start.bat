@echo off
title AgriSmart AI - Precision Crop & Advisory Web App
echo ========================================================================
echo   Starting AgriSmart AI Web Application...
echo ========================================================================
if exist ".venv\Scripts\python.exe" (
    ".venv\Scripts\python.exe" app.py
) else (
    python app.py
)
pause