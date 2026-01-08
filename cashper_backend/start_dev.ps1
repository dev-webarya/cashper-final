# Development Server Start Script
# This script starts the server with optimal settings for development

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Starting Cashper Backend Server" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Server Configuration:" -ForegroundColor Yellow
Write-Host "  - Port: 8000" -ForegroundColor White
Write-Host "  - Auto-reload: Enabled" -ForegroundColor White
Write-Host "  - Reload delay: 1 second" -ForegroundColor White
Write-Host "  - Host: 127.0.0.1`n" -ForegroundColor White

Write-Host "Access Points:" -ForegroundColor Yellow
Write-Host "  - API: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "  - Docs: http://127.0.0.1:8000/docs" -ForegroundColor Green
Write-Host "  - OpenAPI: http://127.0.0.1:8000/openapi.json`n" -ForegroundColor Green

Write-Host "Note: KeyboardInterrupt messages during reload are harmless!" -ForegroundColor Yellow
Write-Host "Press CTRL+C to stop the server`n" -ForegroundColor Yellow

Write-Host "========================================`n" -ForegroundColor Cyan

# Start server with reload delay to prevent rapid reloads
uvicorn app:app --reload --port 8000 --reload-delay 1 --log-level info

