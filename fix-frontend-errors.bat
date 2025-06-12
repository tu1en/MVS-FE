@echo off
echo ========================================
echo    Frontend Error Fix Script
echo ========================================
echo.

:: Change to frontend directory
cd /d "c:\Users\darky\Downloads\SEP490\frontend\porjectFE\MVS-FE"

echo Clearing build cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo - Cleared node_modules cache
)

if exist "build" (
    rmdir /s /q "build"
    echo - Cleared build directory
)

echo.
echo Starting development server...
echo Frontend will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

npm start

pause
