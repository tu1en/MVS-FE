@echo off
echo Installing frontend dependencies...
cd /d "C:\Users\darky\Downloads\SEP490\frontend\porjectFE\MVS-FE"
echo Current directory: %cd%

echo Cleaning cache...
npm cache clean --force

echo Removing problematic directories...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo Removing temp directories...
if exist ".eslint-*" rmdir /s /q ".eslint-*"
if exist ".date-fns-*" rmdir /s /q ".date-fns-*"
if exist ".sucrase-*" rmdir /s /q ".sucrase-*"
if exist ".resolve-*" rmdir /s /q ".resolve-*"

echo Installing dependencies with retry logic...
npm install --no-optional --legacy-peer-deps --verbose
if %errorlevel% neq 0 (
    echo First install failed, trying again...
    npm install --no-optional --legacy-peer-deps --force
)

echo Fixing audit issues...
npm audit fix --legacy-peer-deps

echo Installation completed.
pause
