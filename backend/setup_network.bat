@echo off
:: This script adds a rule to Windows Firewall to allow incoming MCQ Exam traffic on port 5000.
:: It must be run as Administrator.

echo ----------------------------------------------------
echo MCQ Exam System - Firewall Setup Utility
echo ----------------------------------------------------

:: Check for Administrator privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [✓] Running as Administrator...
) else (
    echo [!] ERROR: Please RIGHT-CLICK this file and select 'RUN AS ADMINISTRATOR'.
    pause
    exit /b
)

echo.
echo [1/2] Adding firewall rule for Port 5050...
netsh advfirewall firewall add rule name="MCQ_Exam_Port_5050" dir=in action=allow protocol=TCP localport=5050

echo [2/2] Detecting your local IP Address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
)
echo.
echo ----------------------------------------------------
echo [✓] SUCCESS! The firewall is now open on Port 5050.
echo [!] IMPORTANT: Students should visit: http:%IP%:5050/
echo ----------------------------------------------------
pause
