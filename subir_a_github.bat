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
echo Enviando cambios a GitHub (https://github.com/richard261651/unipide.git)...
%GIT_CMD% push -u origin main --force

echo.
echo ================================================================
if %ERRORLEVEL% EQU 0 (
    echo   [EXITO] Cambios enviados a GitHub correctamente!
    echo   Vercel desplegara la nueva version en unipide.com en 1 minuto.
) else (
    echo   [ERROR AL SUBIR]
    echo   Si te solicita Token o contrasena de GitHub, ingresala aqui.
    echo   (Puedes generar un Personal Access Token en github.com/settings/tokens)
)
echo ================================================================
pause
