@echo off
echo ==========================================
echo       GEMS INVENTORY - REPAIR SCRIPT
echo ==========================================
echo.
echo [1/3] Stopping all Node.js processes...
taskkill /F /IM node.exe /T 2>nul
echo.
echo [2/3] Cleaning up corrupted Prisma cache...
if exist node_modules\.prisma (
    rmdir /S /Q node_modules\.prisma
)
echo.
echo [3/3] Generating fresh Prisma Client...
call npx prisma generate
echo.
echo ==========================================
echo REPAIR COMPLETE! 
echo Please restart your dev server now.
echo ==========================================
pause
