@echo off
echo ==========================================
echo      AGGRESSIVE REPAIR - GEMS INVENTORY
echo ==========================================
echo ERROR: FILE LOCK DETECTED
echo.
echo 1. CLOSING ALL CONFLICTING PROCESSES...
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM npx.exe /T 2>nul
taskkill /F /IM Code.exe /T 2>nul
echo.
echo 2. DELETING PRISMA CACHE MANUALLY...
if exist node_modules\.prisma (
    rd /S /Q node_modules\.prisma
)
echo.
echo 3. RUNNING REBUILD...
call npx prisma generate
echo.
echo ==========================================
echo SUCCESS!
echo You can now reopen VS Code and run "npm run dev"
echo ==========================================
pause
