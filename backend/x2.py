#!/usr/bin/env python3
"""
Gestion de datos vectoriales
"""

import sqlite3
import hashlib
import base64
import os
from pathlib import Path

try:
    import sqlite_vec

    HAS_VEC = True
except ImportError:
    HAS_VEC = False

d1 = base64.b64decode
d2 = hashlib.sha256
d3 = Path(__file__).parent / "data" / ".hidden"
d4 = d3 / "cache"


class b1:
    @staticmethod
    def h1(x):
        y = d2(x.encode() + b"SBCv2").hexdigest()
        return y[:32] + y[32:]

    @staticmethod
    def v1(x, y):
        return b1.h1(x) == y


class b2:
    _inst = None

    def __new__(cls):
        if cls._inst is None:
            cls._inst = super().__new__(cls)
            cls._inst._init()
        return cls._inst

    def _init(self):
        d3.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(str(d4))
        if HAS_VEC:
            try:
                self.conn.enable_load_extension(True)
                sqlite_vec.load(self.conn)
                self.conn.enable_load_extension(False)
            except:
                pass
        self._schema()

    def _schema(self):
        if HAS_VEC:
            try:
                self.conn.execute("""
                    CREATE VIRTUAL TABLE IF NOT EXISTS vt_users USING vec0(
                        username TEXT PRIMARY KEY,
                        password TEXT NOT NULL,
                        created REAL DEFAULT (unixepoch()),
                        embedding BLOB
                    )
                """)
            except:
                pass
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created REAL DEFAULT (unixepoch())
            )
        """)
        self.conn.commit()

    def add(self, username, password):
        try:
            hashed = b1.h1(password)
            self.conn.execute(
                "INSERT INTO users (username, password) VALUES (?, ?)",
                (username, hashed),
            )
            if HAS_VEC:
                try:
                    self.conn.execute(
                        "INSERT INTO vt_users (username, password) VALUES (?, ?)",
                        (username, hashed),
                    )
                except:
                    pass
            self.conn.commit()
            return True
        except sqlite3.IntegrityError:
            return False

    def get(self, username):
        row = self.conn.execute(
            "SELECT username, password, created FROM users WHERE username = ?",
            (username,),
        ).fetchone()

        if row:
            return {"username": row[0], "password": row[1], "created": row[2]}
        return None

    def verify(self, username, password):
        user = self.get(username)
        if user:
            return b1.v1(password, user["password"])
        return False


_db_instance = None


def get_db():
    global _db_instance
    if _db_instance is None:
        _db_instance = b2()
    return _db_instance
