@echo off
echo ==============================================
echo    SECUREEXAM - NEW LAPTOP SETUP SCRIPT
echo ==============================================
echo.
echo This script will install all the required Python libraries
echo so your offline application can run on this new laptop!
echo.
echo Please wait while the libraries are being installed...
echo.

pip install -r requirements.txt

echo.
echo ==============================================
echo    SETUP COMPLETE!
echo ==============================================
echo.
echo Your laptop is now ready to run SecureExam.
echo You can now double-click "start_offline.bat" to launch the app!
echo.
pause
