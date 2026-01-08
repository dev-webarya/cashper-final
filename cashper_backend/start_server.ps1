# Cashper Backend Server Startup Script
# Use this script to start the server with correct configuration

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "🚀 Starting Cashper Backend Server..." -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "📡 Server URL: http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "📚 Swagger UI: http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "🔄 Auto-reload: Enabled" -ForegroundColor Yellow
Write-Host "============================================================`n" -ForegroundColor Cyan

# Start uvicorn with correct host
uvicorn app:app --reload --host 127.0.0.1 --port 8000
