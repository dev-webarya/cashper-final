@echo off
cd /d "%~dp0"
echo Starting Cashper Backend Server...
echo Current directory: %CD%
python run_server.py
pause
