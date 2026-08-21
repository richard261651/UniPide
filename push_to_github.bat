@echo off
echo =======================================================
echo  SUBIR MARKETPLACE UNINORTE A GITHUB
echo =======================================================
echo.
set /p REPO_URL="Pega la URL de tu repositorio de GitHub (ej: https://github.com/usuario/tienda.git): "

if "%REPO_URL%"=="" (
    echo No ingresaste ninguna URL. Operacion cancelada.
    pause
    exit /b
)

git init
git add .
git commit -m "feat: Marketplace de Emprendimientos Uninorte completo"
git branch -M main
git remote add origin %REPO_URL%
git push -u origin main

echo.
echo =======================================================
echo  Codigo subido con exito a GitHub!
echo  Ahora puedes importarlo en Vercel.com
echo =======================================================
pause
