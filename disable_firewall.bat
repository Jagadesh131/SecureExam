@echo off
echo =======================================================
echo    SECUREEXAM - DISABLE FIREWALL (RUN AS ADMIN)
echo =======================================================
echo.
echo Turning off Windows Firewall temporarily...
netsh advfirewall set allprofiles state off
echo.
echo Firewall is now OFF. Try loading the page on your phone again!
echo (Remember to turn it back on after your presentation!)
echo.
pause
