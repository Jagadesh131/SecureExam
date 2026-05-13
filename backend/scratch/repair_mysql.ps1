# XAMPP MySQL Repair Script
$xamppPath = "C:\xampp"
$mysqlPath = "$xamppPath\mysql"
$dataPath = "$mysqlPath\data"
$backupPath = "$mysqlPath\backup"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

Write-Host "Stopping MySQL and Apache..." -ForegroundColor Cyan
taskkill /F /IM mysqld.exe /T 2>$null
taskkill /F /IM httpd.exe /T 2>$null

Write-Host "Backing up old data folder..." -ForegroundColor Cyan
if (Test-Path $dataPath) {
    Rename-Item -Path $dataPath -NewName "data_corrupt_$timestamp"
}

Write-Host "Initializing fresh data folder from backup..." -ForegroundColor Cyan
Copy-Item -Path $backupPath -Destination $dataPath -Recurse

Write-Host "SUCCESS! Database has been reset to factory settings." -ForegroundColor Green
Write-Host "Your Python code will automatically recreate all your tables when you run it." -ForegroundColor Yellow
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Open XAMPP Control Panel (as Administrator)"
Write-Host "2. Click Start on Apache and MySQL"
Write-Host "3. Run 'python app.py' in VS Code"
