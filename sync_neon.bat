@echo off
set "PATH=C:\Users\richard\NodeJS;C:\Users\richard\MinGit\cmd;%PATH%"
cd /d "c:\Users\richard\Desktop\Repositorios\tienda"

echo Conectando a Neon PostgreSQL y creando tablas...
call "C:\Users\richard\NodeJS\npx.cmd" prisma db push --accept-data-loss
echo.
echo Proceso finalizado.
