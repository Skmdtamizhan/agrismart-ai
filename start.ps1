Write-Host "========================================================================" -ForegroundColor Green
Write-Host "  Starting AgriSmart AI Web Application..." -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Green
if (Test-Path ".venv\Scripts\python.exe") {
    & ".venv\Scripts\python.exe" app.py
} else {
    python app.py
}