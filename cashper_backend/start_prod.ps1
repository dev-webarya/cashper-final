# Production Server Start Script
# This script starts the server without auto-reload for production use

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Starting Cashper Backend (PRODUCTION)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Server Configuration:" -ForegroundColor Yellow
Write-Host "  - Port: 8000" -ForegroundColor White
Write-Host "  - Auto-reload: Disabled" -ForegroundColor White
Write-Host "  - Workers: 4" -ForegroundColor White
Write-Host "  - Host: 0.0.0.0 (accessible from network)`n" -ForegroundColor White

Write-Host "Note: No auto-reload in production mode" -ForegroundColor Yellow
Write-Host "Press CTRL+C to stop the server`n" -ForegroundColor Yellow

Write-Host "========================================`n" -ForegroundColor Cyan

# Start server in production mode (no reload)
uvicorn app:app --host 0.0.0.0 --port 8000 --workers 4 --log-level warning

