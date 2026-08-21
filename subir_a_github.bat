@echo off
title Subir UniPide a GitHub
echo ================================================================
echo   SUBIENDO CAMBIOS DE UNIPIDE A GITHUB Y VERCEL
echo ================================================================
echo.

set GIT_CMD="C:\Users\richa\MinGit\cmd\git.exe"
if not exist %GIT_CMD% (
    set GIT_CMD="C:\Users\%USERNAME%\MinGit\cmd\git.exe"
)
if not exist %GIT_CMD% (
    set GIT_CMD=git
)

echo Preparando cambios...
%GIT_CMD% add .
%GIT_CMD% commit -m "feat: Sistema de doble correo obligatorio y mensajeria" 2>nul
echo.
echo Enviando cambios a GitHub (rama main)...
%GIT_CMD% push -u origin main

echo.
echo ================================================================
if %ERRORLEVEL% EQU 0 (
    echo   [EXITO] Cambios enviados a GitHub correctamente!
    echo   Vercel iniciara el despliegue automatico en unipide.com en unos segundos.
) else (
    echo   [ATENCION] Si te solicito credenciales o Token de GitHub,
    echo   ingresa tu usuario y Personal Access Token (o autoriza en navegador).
)
echo ================================================================
pause
