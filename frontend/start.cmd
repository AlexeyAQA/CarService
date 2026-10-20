@echo off
setlocal
cd /d "%~dp0"
set "CAR_SERVICE_NODE_EXE=node"
where node >nul 2>nul
if errorlevel 1 set "CAR_SERVICE_NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "node_modules\vite\bin\vite.js" (
  echo Dependencies are missing. Install Node.js and pnpm, then run: pnpm install --frozen-lockfile
  pause
  exit /b 1
)
echo Starting Service Book at http://127.0.0.1:5173
echo Press Ctrl+C to stop.
"%CAR_SERVICE_NODE_EXE%" "node_modules\vite\bin\vite.js" --host 127.0.0.1
if errorlevel 1 pause
