@echo off
:: This script starts the MCQ Exam System connected to the TiDB Cloud Database.
:: It explicitly clears the offline flag to ensure the cloud database is used.

echo ----------------------------------------------------
echo MCQ Exam System - Cloud Mode (TiDB)
echo ----------------------------------------------------

:: Ensure we are not in offline mode
set USE_OFFLINE_DB=0

:: Check if virtual environment exists
if exist ".venv\Scripts\activate.bat" (
    echo [✓] Activating Python Virtual Environment...
    call .venv\Scripts\activate.bat
)

echo.
echo [✓] Connecting to TiDB Cloud Database...
echo [✓] Starting SecureExam Server...
echo.

python app.py
pause
