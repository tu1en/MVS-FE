@echo off
echo =====================================
echo CLASSROOM MANAGEMENT SYSTEM - FRONTEND
echo =====================================
echo.

cd /d "c:\Users\darky\Downloads\SEP490\frontend\porjectFE\MVS-FE"
echo Current directory: %CD%
echo.

echo Checking if package.json exists...
if exist package.json (
    echo ✅ package.json found
    echo Checking project configuration...
    type package.json | findstr "name"
) else (
    echo ❌ package.json NOT found
    exit /b 1
)
echo.

echo Checking Node.js version...
node --version
echo.

echo Checking npm version...
npm --version
echo.

echo Installing dependencies...
npm install
echo.

echo Starting React development server...
echo Frontend will be available at: http://localhost:3000
echo.

npm start

pause
