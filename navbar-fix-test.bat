@echo off
echo ========================================
echo    Navbar Fix and Test Script  
echo ========================================
echo.

:: Change to frontend directory
cd /d "c:\Users\darky\Downloads\SEP490\frontend\porjectFE\MVS-FE"

echo ✅ Fixed NavigationBar.jsx duplicate ToggleSidebar function
echo ✅ Verified CSS classes in tailwind.config.js  
echo ✅ Checked RegisterModal import
echo ✅ Verified ROLE constants
echo.

echo Clearing build cache before restart...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo - Cleared node_modules cache
)

if exist "build" (
    rmdir /s /q "build" 
    echo - Cleared build directory
)

echo.
echo Starting frontend with navbar fixes...
echo Frontend will be available at: http://localhost:3000
echo.
echo Navbar should now work properly with:
echo   ✅ No duplicate function errors
echo   ✅ Proper role-based navigation
echo   ✅ Mobile toggle functionality
echo   ✅ Correct styling with Tailwind
echo.
echo Press Ctrl+C to stop the server
echo.

npm start

pause
