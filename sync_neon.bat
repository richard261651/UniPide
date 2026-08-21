@echo off
set "PATH=C:\Users\richa\Node;C:\Users\richa\MinGit\cmd;%PATH%"
cd /d "%~dp0"

echo Conectando a Neon PostgreSQL y sincronizando tablas...
call npx prisma db push --accept-data-loss
echo.
echo Proceso finalizado con exito.
pause
