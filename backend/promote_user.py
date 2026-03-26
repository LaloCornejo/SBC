#!/usr/bin/env python3
"""Script para promover un usuario a experto o admin"""

import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from x2 import get_db


def promote_user(username: str, role: str = "expert"):
    db = get_db()
    user = db.get(username)
    if not user:
        print(f"Error: Usuario '{username}' no encontrado")
        return False

    try:
        db.conn.execute(
            "UPDATE users SET role = ? WHERE username = ?",
            (role, username),
        )
        db.conn.commit()
        print(f"Usuario '{username}' promovido a '{role}' exitosamente")
        return True
    except Exception as e:
        print(f"Error al promover usuario: {e}")
        return False


def list_users():
    db = get_db()
    rows = db.conn.execute(
        "SELECT username, role, created FROM users ORDER BY created"
    ).fetchall()

    if not rows:
        print("No hay usuarios registrados")
        return

    print("\nUsuarios registrados:")
    print("-" * 50)
    for row in rows:
        print(f"  {row[0]:20} | Rol: {row[1] or 'student':10} | Creado: {row[2]}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso:")
        print("  python promote_user.py list                    - Listar usuarios")
        print(
            "  python promote_user.py <username> [role]       - Promover usuario (role: student, expert, admin)"
        )
        sys.exit(1)

    command = sys.argv[1]

    if command == "list":
        list_users()
    else:
        username = command
        role = sys.argv[2] if len(sys.argv) > 2 else "expert"
        if role not in ("student", "expert", "admin"):
            print(f"Error: Rol '{role}' no válido. Use: student, expert, admin")
            sys.exit(1)
        promote_user(username, role)
