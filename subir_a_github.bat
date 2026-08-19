@echo off
title Subir UniPide a GitHub
echo ================================================================
echo   SUBIENDO PROYECTO A GITHUB: richard261651/unipide
echo ================================================================
echo.
echo Presiona cualquier tecla para enviar el codigo a tu repositorio...
pause >nul

"C:\Users\richard\MinGit\cmd\git.exe" push -u origin main

echo.
echo ================================================================
if %ERRORLEVEL% EQU 0 (
    echo   EXITO: Codigo subido correctamente a GitHub!
    echo   Ahora puedes ir a https://vercel.com/new y desplegarlo.
) else (
    echo   Si te pidio inicio de sesion, completa la autorizacion.
)
echo ================================================================
pause
