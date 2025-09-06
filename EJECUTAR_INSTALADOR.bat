@echo off
title NeuralEdge AI - Instalador Directo
color 0A
cls

echo.
echo ===============================================
echo      NEURALEDGE AI - INSTALADOR DIRECTO
echo            Version 2.0.0 Enterprise
echo ===============================================
echo.
echo Este es tu instalador completo y listo para usar.
echo.
echo Solo ejecuta: INSTALAR_NEURALEDGE_AI.bat
echo.
echo O arrastra este archivo donde quieras y ejecutalo.
echo.

echo ¿Quieres instalar ahora? (S/N):
set /p respuesta=""

if /i "%respuesta%"=="S" goto instalar
if /i "%respuesta%"=="SI" goto instalar
goto salir

:instalar
call "INSTALAR_NEURALEDGE_AI.bat"
goto fin

:salir
echo.
echo Para instalar después, ejecuta: INSTALAR_NEURALEDGE_AI.bat
echo.

:fin
pause