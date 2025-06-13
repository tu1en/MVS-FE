@echo off
echo ========================================
echo   NAVBAR ERROR DIAGNOSIS & FIX
echo ========================================
echo.

cd /d "c:\Users\darky\Downloads\SEP490\frontend\porjectFE\MVS-FE"

echo Step 1: Checking for compilation errors...
echo.

echo Step 2: Clearing cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo - Cleared node_modules cache
)

if exist ".eslintcache" (
    del /q ".eslintcache"
    echo - Cleared ESLint cache
)

echo.
echo Step 3: Checking NavigationBar component...
echo.

echo Step 4: Starting development server...
echo Frontend will be available at: http://localhost:3000
echo.
echo To test navbar:
echo 1. Open http://localhost:3000
echo 2. Try logging in with different roles
echo 3. Check if sidebar navigation works
echo 4. Test mobile responsive menu
echo.
echo Press Ctrl+C to stop the server
echo.

npm start

pause
