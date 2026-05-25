@echo off
echo ==============================================
echo       SECUREEXAM - OFFLINE MODE LAUNCHER
echo ==============================================
echo Starting in fully offline mode using local SQLite database...
echo.

set USE_OFFLINE_DB=1

cd backend
python app.py
