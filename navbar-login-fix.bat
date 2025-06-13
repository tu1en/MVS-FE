@echo off
echo ========================================
echo    Navbar Login Status Fix Script  
echo ========================================
echo.

:: Change to frontend directory
cd /d "c:\Users\darky\Downloads\SEP490\frontend\porjectFE\MVS-FE"

echo ✅ Fixed authSlice.js - Added syncFromLocalStorage action
echo ✅ Fixed Header.jsx - Added useEffect to sync Redux state on mount
echo ✅ Fixed NavigationBar.jsx - Added syncFromLocalStorage on component mount
echo.

echo What this fix does:
echo   ✅ Syncs Redux state with localStorage when components mount
echo   ✅ Ensures isLogin state is correctly updated after login
echo   ✅ Header will show notifications instead of login buttons when logged in
echo   ✅ NavigationBar will show role-based menu instead of guest menu
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
echo Starting frontend with navbar login fixes...
echo Frontend will be available at: http://localhost:3000
echo.
echo After login, navbar should now:
echo   ✅ Show notification bell instead of login buttons
echo   ✅ Show role-based navigation menu
echo   ✅ Display proper logout button in Quick Actions
echo.
echo Press Ctrl+C to stop the server
echo.

npm start

pause
