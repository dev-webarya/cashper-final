@echo off
cls
echo.
echo ============================================================
echo 🚀 Starting Cashper Backend Server...
echo ============================================================
echo 📡 Server URL: http://127.0.0.1:8000
echo 📚 Swagger UI: http://127.0.0.1:8000/docs
echo 🔄 Auto-reload: Enabled
echo ============================================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Virtual environment not found. Creating...
    python -m venv venv
    echo Virtual environment created.
    echo.
)

REM Activate virtual environment (if exists)
if exist "venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call venv\Scripts\activate
)

REM Start the server with correct host
python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000

