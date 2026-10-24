@echo off
setlocal
cd /d "%~dp0"
echo Installing VNUK CareerBridge dependencies...
call npm install
if errorlevel 1 goto error
call npm --prefix server install
if errorlevel 1 goto error
call npm --prefix client install
if errorlevel 1 goto error
echo.
echo Setup complete. Run start.bat to launch the demo.
pause
exit /b 0
:error
echo Dependency installation failed. Please check your Node.js and npm installation or network access.
pause
exit /b 1
