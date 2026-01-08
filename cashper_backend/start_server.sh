#!/bin/bash

echo "========================================"
echo "  Cashper Backend Server Startup"
echo "========================================"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Creating..."
    python3 -m venv venv
    echo "Virtual environment created."
    echo ""
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install/Update dependencies
echo "Installing dependencies..."
pip install -r requirements.txt --quiet

echo ""
echo "========================================"
echo "  Starting Cashper Backend API Server"
echo "========================================"
echo ""
echo "Server will be available at:"
echo "  - http://localhost:8000"
echo "  - API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================"
echo ""

# Start the server
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000

