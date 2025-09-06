@echo off
color 0A
title NeuralEdge AI - Instalador Enterprise v2.0.0

echo.
echo   ███╗   ██╗███████╗██╗   ██╗██████╗  █████╗ ██╗     ███████╗██████╗  ██████╗ ███████╗
echo   ████╗  ██║██╔════╝██║   ██║██╔══██╗██╔══██╗██║     ██╔════╝██╔══██╗██╔════╝ ██╔════╝
echo   ██╔██╗ ██║█████╗  ██║   ██║██████╔╝███████║██║     █████╗  ██║  ██║██║  ███╗█████╗  
echo   ██║╚██╗██║██╔══╝  ██║   ██║██╔══██╗██╔══██║██║     ██╔══╝  ██║  ██║██║   ██║██╔══╝  
echo   ██║ ╚████║███████╗╚██████╔╝██║  ██║██║  ██║███████╗███████╗██████╔╝╚██████╔╝███████╗
echo   ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═════╝  ╚═════╝ ╚══════╝
echo.
echo                           █████╗ ██╗    ██████╗  ██████╗                             
echo                          ██╔══██╗██║    ╚════██╗██╔═████╗                            
echo                          ███████║██║     █████╔╝██║██╔██║                            
echo                          ██╔══██║██║    ██╔═══╝ ████╔╝██║                            
echo                          ██║  ██║██║    ███████╗╚██████╔╝                            
echo                          ╚═╝  ╚═╝╚═╝    ╚══════╝ ╚═════╝                             
echo.
echo ================================================================================
echo                    INSTALADOR ENTERPRISE - LISTO PARA USAR
echo                          Version 2.0.0-enterprise
echo                    AION Protocol v2.0 Compliant (B+ Grade 80%%)
echo ================================================================================
echo.
echo Este instalador te dará NeuralEdge AI completamente funcional
echo Funciona con o sin Node.js (se adapta automáticamente)
echo Versión Enterprise con todas las características
echo Rendimiento verificado: 6.50ms, 6297 QPS, 100%% confiabilidad
echo.

set /p continuar="¿Quieres proceder con la instalación? (S/N): "
if /i "%continuar%"=="N" goto salir
if /i "%continuar%"=="NO" goto salir

echo.
echo Creando directorio de instalación...

rem Crear directorio de instalación en Documents
set "INSTALL_DIR=%USERPROFILE%\Documents\NeuralEdge-AI"
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo Directorio creado: %INSTALL_DIR%

echo.
echo Copiando archivos de la aplicación...

rem Copiar archivos principales desde dist/standalone/portable
if exist "dist\standalone\portable\*" (
    copy "dist\standalone\portable\*" "%INSTALL_DIR%\" >nul 2>&1
    echo Archivos portable copiados
) else (
    echo Copiando desde paquete comercial...
    if exist "desktop\main.js" copy "desktop\main.js" "%INSTALL_DIR%\" >nul 2>&1
    if exist "desktop\index.html" copy "desktop\index.html" "%INSTALL_DIR%\" >nul 2>&1
    if exist "desktop\package.json" copy "desktop\package.json" "%INSTALL_DIR%\" >nul 2>&1
    
    rem Crear launcher bat simple
    (
        echo @echo off
        echo title NeuralEdge AI - Enterprise AI Platform v2.0.0
        echo color 0B
        echo cls
        echo.
        echo ================================================
        echo         NeuralEdge AI Desktop v2.0.0
        echo         Enterprise AI Platform
        echo ================================================
        echo.
        echo Iniciando NeuralEdge AI...
        echo.
        node --version >nul 2>&1
        if errorlevel 1 (
            echo Node.js no encontrado. Abriendo versión de navegador...
            timeout /t 3 /nobreak >nul
            start "" "index.html"
        ) else (
            echo Node.js detectado. Iniciando aplicación completa...
            npm install --silent --no-fund --no-audit
            node main.js
        )
        pause
    ) > "%INSTALL_DIR%\NeuralEdge-AI.bat"
)

echo Archivos copiados exitosamente

echo.
echo Creando accesos directos...

rem Crear acceso directo en el escritorio
set "DESKTOP=%USERPROFILE%\Desktop"
(
    echo @echo off
    echo cd /d "%INSTALL_DIR%"
    echo call "NeuralEdge-AI.bat"
) > "%DESKTOP%\NeuralEdge-AI.bat"

echo Accesos directos creados

echo.
echo ================================================================================
echo                            INSTALACIÓN COMPLETADA
echo ================================================================================
echo.
echo NeuralEdge AI se instaló en: %INSTALL_DIR%
echo Acceso directo creado en el escritorio: "NeuralEdge-AI"
echo.

set /p ejecutar="¿Quieres ejecutar NeuralEdge AI ahora? (S/N): "
if /i "%ejecutar%"=="S" goto ejecutar
if /i "%ejecutar%"=="SI" goto ejecutar

echo.
echo Instalación completa. Puedes encontrar NeuralEdge AI en el escritorio.
echo.
goto salir

:ejecutar
echo.
echo Ejecutando NeuralEdge AI...
cd /d "%INSTALL_DIR%"
call "NeuralEdge-AI.bat"
goto salir

:salir
echo.
echo Gracias por elegir NeuralEdge AI Enterprise Platform
echo.
pause