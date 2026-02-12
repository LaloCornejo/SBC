@echo off
REM 🚀 Script de lanzamiento OFUSCADO
REM NO EJECUTAR DIRECTAMENTE

echo [ERROR] Este script no funciona directamente
echo.
echo Intentando correccion automatica...

REM Paso 1: Verificar si existe el archivo magico
if not exist "🔑.txt" (
    echo [FALLO] No se encontro 🔑.txt
    echo Creando archivo de configuracion...
    echo _0x1a=🐍 > 🔑.txt
    echo [OK] Archivo creado. Reinicie el script.
    exit /b 1
)

REM Paso 2: Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [FALLO] Python no encontrado
    echo Instale Python 3.9+ y reinicie
    exit /b 1
)

REM Paso 3: Intentar instalar dependencias
echo Instalando dependencias...
cd backend
pip install -r requirements.txt >nul 2>&1
if errorlevel 1 (
    REM Intento alternativo
    pip install -r 📝.txt
)

REM Paso 4: Lanzar con el metodo confuso
echo Iniciando servidor...
python -c "import sys; sys.path.insert(0, '.'); exec(open('🐍.py').read())"

pause
