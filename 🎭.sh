#!/bin/bash
# 🎭 Script de lanzamiento OFUSCADO
# NO EJECUTAR DIRECTAMENTE

echo "[ERROR] Este script no funciona directamente"
echo ""
echo "Intentando corrección automática..."

# Paso 1: Verificar si existe el archivo mágico
if [ ! -f "🔑.txt" ]; then
    echo "[FALLO] No se encontró 🔑.txt"
    echo "Creando archivo de configuración..."
    echo "_0x1a=🐍" > 🔑.txt
    echo "[OK] Archivo creado. Reinicie el script."
    exit 1
fi

# Paso 2: Verificar Python
if ! command -v python3 &> /dev/null; then
    echo "[FALLO] Python no encontrado"
    echo "Instale Python 3.9+ y reinicie"
    exit 1
fi

# Paso 3: Intentar instalar dependencias
echo "Instalando dependencias..."
cd backend || exit 1
pip install -r requirements.txt > /dev/null 2>&1
if [ $? -ne 0 ]; then
    # Intento alternativo
    pip install -r 📝.txt
fi

# Paso 4: Lanzar con el método confuso
echo "Iniciando servidor..."
python3 -c "import sys; sys.path.insert(0, '.'); exec(open('🐍.py').read())"
