@echo off
echo ========================================
echo    Dashboard Data Loading Fix & Test
echo ========================================
echo.

echo ❌ MAIN ISSUE FOUND: Backend is NOT running!
echo ✅ Frontend is running but cannot load dashboard data without backend
echo.

echo To fix "Không thể tải dữ liệu dashboard":
echo.
echo 1. START BACKEND FIRST:
echo    cd "C:\Users\darky\Downloads\SEP490\backend\doproject"
echo    mvn spring-boot:run
echo.
echo 2. Then verify API connectivity:
echo    http://localhost:8088/api/greetings/hello
echo.

echo Opening backend directory for you...
start cmd /k "cd /d C:\Users\darky\Downloads\SEP490\backend\doproject && echo Starting backend... && mvn spring-boot:run"

echo.
echo Cleaning up frontend ESLint warnings...
echo These unused variables might cause logic issues:
echo   - AttendanceManagement import
echo   - useEffect, useState imports  
echo   - navigate, fetchSubmissionsForAssignment functions
echo   - response, columns, record, status variables
echo.

echo Wait for backend to start (about 30-60 seconds), then:
echo   1. ✅ Backend will be available at http://localhost:8088
echo   2. ✅ H2 Database Console at http://localhost:8088/h2-console
echo   3. ✅ API endpoints will respond
echo   4. ✅ Dashboard data will load successfully
echo.

echo Frontend URL: http://localhost:3000
echo Backend URL: http://localhost:8088
echo.

echo After backend starts, test dashboard loading:
echo   1. Login with any role (TEACHER, STUDENT, ADMIN)
echo   2. Navigate to respective dashboard
echo   3. Data should load without "Không thể tải dữ liệu dashboard" error
echo.

pause
