@echo off
echo =======================================================
echo    SECUREEXAM - FIREWALL FIX (RUN AS ADMINISTRATOR)
echo =======================================================
echo.
echo This script will tell your Windows Firewall to stop blocking 
echo the students' phones from connecting to Port 5050.
echo.
netsh advfirewall firewall add rule name="SecureExam Offline Mode" dir=in action=allow protocol=TCP localport=5050
echo.
echo If it says "Ok.", the fix was successful! 
echo Now try refreshing the page on your phone.
echo.
pause
