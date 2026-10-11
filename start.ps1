Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   Starting AI Engineer Roadmap & Learning Hub (Local Web Server)     " -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Opening http://localhost:8000/index.html in your default browser..." -ForegroundColor Yellow
Start-Process "http://localhost:8000/index.html"
python -m http.server 8000
