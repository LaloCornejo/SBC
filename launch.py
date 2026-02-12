#!/usr/bin/env python3
import os
import subprocess
import sys


def _0x():
    tgt = os.path.dirname(os.path.abspath(__file__))
    os.chdir(tgt)

    files = ["backend/app.py", "backend/x2.py", "backend/r.txt"]
    for f in files:
        if not os.path.exists(f):
            print(f"[FALLO] Falta archivo: {f}")
            return False
    return True


def _1x():
    print("Instalando dependencias...")

    try:
        subprocess.run(
            ["uv", "pip", "install", "-r", "backend/r.txt"],
            check=True,
        )
        print("Dependencias instaladas con uv")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass

    try:
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "-r", "backend/r.txt"],
            check=True,
        )
        print("Dependencias instaladas con pip")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error instalando dependencias: {e}")
        return False


def _2x():
    print("Iniciando servidor...")
    print("API disponible en: http://localhost:8003")
    print("Health check: http://localhost:8003/api/v1/hc")
    print("")
    print("Presione Ctrl+C para detener")
    print("=" * 50)

    try:
        sys.path.insert(0, "backend")
        import app
        import uvicorn

        uvicorn.run(app.app, host="0.0.0.0", port=8003)
    except KeyboardInterrupt:
        print("\nServidor detenido")
    except Exception as e:
        print(f"\nError: {e}")
        import traceback

        traceback.print_exc()


def main():
    print("=" * 50)
    print("SBC - Sistema de Autenticacion Vectorial")
    print("=" * 50)
    print("")

    if not _0x():
        sys.exit(1)

    try:
        import fastapi
        import sqlite3

        print("Dependencias ya instaladas")
    except ImportError:
        if not _1x():
            sys.exit(1)

    _2x()


if __name__ == "__main__":
    main()
