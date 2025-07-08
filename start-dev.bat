@echo off
echo Starting React Frontend...
cd /d "C:\Users\darky\Downloads\SEP490\frontend\porjectFE\MVS-FE"

echo Setting environment variables...
set GENERATE_SOURCEMAP=false
set NODE_OPTIONS=--no-deprecation
set SKIP_PREFLIGHT_CHECK=true
set DISABLE_ESLINT_PLUGIN=true

echo Starting development server...
npm start

pause
