
@echo off
echo Starting Prisma Generate...
call npx prisma generate
echo Prisma Generate Finished with code %ERRORLEVEL%
echo Starting Prisma DB Push...
call npx prisma db push --accept-data-loss
echo Prisma DB Push Finished with code %ERRORLEVEL%
echo Starting Build...
call npm run build
echo Build Finished with code %ERRORLEVEL%
