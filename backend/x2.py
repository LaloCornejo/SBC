#!/usr/bin/env python3
"""
Gestion de datos vectoriales
"""

import json
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
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS questions (
                id INTEGER PRIMARY KEY,
                number INTEGER UNIQUE NOT NULL,
                text TEXT NOT NULL,
                language TEXT NOT NULL,
                yes_next INTEGER,
                no_next INTEGER
            )
        """)
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS diagnostic_results (
                id INTEGER PRIMARY KEY,
                username TEXT NOT NULL,
                result TEXT NOT NULL,
                python_score INTEGER NOT NULL,
                cpp_score INTEGER NOT NULL,
                java_score INTEGER NOT NULL,
                difficulty_responses TEXT DEFAULT '[]',
                created REAL DEFAULT (unixepoch()),
                FOREIGN KEY (username) REFERENCES users(username)
            )
        """)
        try:
            self.conn.execute(
                "ALTER TABLE diagnostic_results ADD COLUMN difficulty_responses TEXT DEFAULT '[]'"
            )
        except Exception:
            pass
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS temas (
                id INTEGER PRIMARY KEY,
                curso TEXT NOT NULL,
                nivel TEXT NOT NULL,
                id_capitulo INTEGER NOT NULL,
                titulo_capitulo TEXT NOT NULL,
                UNIQUE(curso, nivel, id_capitulo)
            )
        """)
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS secciones (
                id INTEGER PRIMARY KEY,
                tema_id INTEGER NOT NULL,
                id_seccion INTEGER NOT NULL,
                tipo TEXT NOT NULL,
                titulo TEXT NOT NULL,
                cuerpo TEXT NOT NULL,
                codigo TEXT,
                FOREIGN KEY (tema_id) REFERENCES temas(id)
            )
        """)
        self._seed_questions()
        self._seed_temas()
        self.conn.commit()

    def _seed_questions(self):
        count = self.conn.execute("SELECT COUNT(*) FROM questions").fetchone()[0]
        if count > 0:
            return
        questions = [
            (
                1,
                '¿Te gustaría crear programas que puedan "aprender" o tomar decisiones inteligentes?',
                "Python",
                2,
                7,
            ),
            (
                2,
                "¿Te llama la atención trabajar analizando grandes cantidades de datos?",
                "Python",
                3,
                19,
            ),
            (
                3,
                "¿Te gustaría desarrollar sistemas que puedan predecir resultados futuros?",
                "Python",
                4,
                27,
            ),
            (
                4,
                "¿Te interesa automatizar tareas para ahorrar tiempo?",
                "Python",
                5,
                26,
            ),
            (
                5,
                "¿Prefieres ver resultados funcionales en poco tiempo cuando programas?",
                "Python",
                6,
                21,
            ),
            (
                6,
                "¿Te gusta crear pequeños programas o scripts para resolver problemas específicos?",
                "Python",
                33,
                20,
            ),
            (
                7,
                "¿Te gustaría participar en el desarrollo de videojuegos?",
                "C++",
                8,
                13,
            ),
            (
                8,
                "¿Te interesa programar cosas que estén muy cerca del funcionamiento del hardware?",
                "C++",
                9,
                24,
            ),
            (
                9,
                "¿Te llama la atención cómo funcionan los sistemas operativos por dentro?",
                "C++",
                10,
                32,
            ),
            (
                10,
                "¿Te gusta mejorar programas para que funcionen más rápido y consuman menos recursos?",
                "C++",
                11,
                17,
            ),
            (
                11,
                "¿Estarías dispuesto a trabajar gestionando manualmente la memoria de un programa?",
                "C++",
                12,
                16,
            ),
            (12, "¿Te motivan los retos técnicos difíciles?", "C++", 38, 25),
            (
                13,
                "¿Te gustaría desarrollar software para empresas grandes?",
                "Java",
                14,
                19,
            ),
            (
                14,
                '¿Te interesa trabajar en la parte "detrás" de las aplicaciones web (backend)?',
                "Java",
                15,
                26,
            ),
            (
                15,
                "¿Te gustaría crear APIs que conecten diferentes sistemas?",
                "Java",
                16,
                21,
            ),
            (
                16,
                "¿Te gusta organizar programas usando clases y objetos?",
                "Java",
                17,
                22,
            ),
            (
                17,
                "¿Te atraen los proyectos grandes que requieren estructura y organización?",
                "Java",
                18,
                20,
            ),
            (18, "¿Te gustaría desarrollar aplicaciones para Android?", "Java", 36, 19),
            (19, "¿Disfrutas las matemáticas avanzadas?", "C++,Python", 20, 23),
            (
                20,
                "¿Te sientes cómodo resolviendo problemas de lógica abstracta?",
                "C++",
                24,
                33,
            ),
            (
                21,
                "¿Prefieres que un lenguaje sea sencillo aunque tenga menos control interno?",
                "Python",
                34,
                22,
            ),
            (
                22,
                "¿Prefieres tener control total del programa aunque sea más complejo?",
                "C++",
                28,
                25,
            ),
            (23, "¿Te desesperan los errores difíciles de entender?", "Python", 34, 24),
            (
                24,
                "¿Te interesa entender cómo funciona una computadora internamente?",
                "C++",
                28,
                29,
            ),
            (
                25,
                "¿Te gusta seguir reglas y estructuras bien definidas al programar?",
                "Java",
                30,
                33,
            ),
            (
                26,
                "¿Te interesa crear aplicaciones web de manera rápida?",
                "Python",
                27,
                31,
            ),
            (
                27,
                "¿Te gustaría desarrollar herramientas para investigación científica?",
                "Python",
                35,
                28,
            ),
            (
                28,
                "¿Te interesan los dispositivos electrónicos pequeños (como microcontroladores)?",
                "C++",
                37,
                29,
            ),
            (
                29,
                "¿Te gustaría desarrollar software para bancos o sistemas financieros?",
                "Java",
                30,
                32,
            ),
            (
                30,
                "¿Te interesa trabajar con servidores e infraestructura?",
                "Java",
                31,
                38,
            ),
            (
                31,
                "¿Te gustaría crear aplicaciones que funcionen en múltiples plataformas?",
                "Java",
                39,
                32,
            ),
            (
                32,
                "¿Te interesa que tus programas tengan el máximo rendimiento posible?",
                "C++",
                37,
                33,
            ),
            (33, "¿Estás comenzando tu camino en la programación?", "Python", 34, 36),
            (
                34,
                "¿Prefieres un lenguaje con sintaxis clara y fácil de leer?",
                "Python",
                35,
                40,
            ),
            (
                35,
                "¿Te interesa aprender un lenguaje muy utilizado en ciencia de datos?",
                "Python",
                40,
                36,
            ),
            (
                36,
                "¿Te gustaría aprender un lenguaje muy usado en empresas grandes?",
                "Java",
                39,
                37,
            ),
            (
                37,
                "¿Te gustaría trabajar en estudios profesionales de videojuegos?",
                "C++",
                38,
                40,
            ),
            (
                38,
                "¿Te interesa trabajar en proyectos donde la eficiencia sea crítica?",
                "C++",
                -1,
                39,
            ),
            (
                39,
                "¿Te gustaría desarrollar aplicaciones de escritorio completas y complejas?",
                "Java",
                40,
                40,
            ),
            (
                40,
                "¿Te importa que el lenguaje tenga una comunidad grande y muchos recursos de aprendizaje?",
                "Python",
                -1,
                -1,
            ),
        ]
        self.conn.executemany(
            "INSERT INTO questions (number, text, language, yes_next, no_next) VALUES (?, ?, ?, ?, ?)",
            questions,
        )

    def _seed_temas(self):
        count = self.conn.execute("SELECT COUNT(*) FROM temas").fetchone()[0]
        if count > 0:
            return
        json_dir = Path(__file__).parent.parent
        json_files = (
            sorted(json_dir.glob("*_basico.json"))
            + sorted(json_dir.glob("*_intermedio.json"))
            + sorted(json_dir.glob("*_avanzado.json"))
        )
        for jf in json_files:
            with open(jf, "r", encoding="utf-8") as f:
                data = json.load(f)
            curso = data["curso"]
            nivel = data["nivel"]
            for cap in data["capitulos"]:
                self.conn.execute(
                    "INSERT INTO temas (curso, nivel, id_capitulo, titulo_capitulo) VALUES (?, ?, ?, ?)",
                    (curso, nivel, cap["num_capitulo"], cap["titulo"]),
                )
                tema_id = self.conn.execute(
                    "SELECT id FROM temas WHERE curso = ? AND nivel = ? AND id_capitulo = ?",
                    (curso, nivel, cap["num_capitulo"]),
                ).fetchone()[0]
                for sec in cap["secciones"]:
                    self.conn.execute(
                        "INSERT INTO secciones (tema_id, id_seccion, tipo, titulo, cuerpo, codigo) VALUES (?, ?, ?, ?, ?, ?)",
                        (
                            tema_id,
                            sec["id"],
                            sec["tipo"],
                            sec["titulo"],
                            sec["cuerpo"],
                            sec.get("codigo"),
                        ),
                    )

    def get_temas_by_language(self, language: str):
        rows = self.conn.execute(
            "SELECT id, curso, nivel, id_capitulo, titulo_capitulo FROM temas WHERE curso = ? ORDER BY id_capitulo",
            (language,),
        ).fetchall()
        result = []
        for r in rows:
            tema = {
                "id": r[0],
                "curso": r[1],
                "nivel": r[2],
                "id_capitulo": r[3],
                "titulo_capitulo": r[4],
                "secciones": self._get_secciones_for_tema(r[0]),
            }
            result.append(tema)
        return result

    def _get_secciones_for_tema(self, tema_id: int):
        rows = self.conn.execute(
            "SELECT id, id_seccion, tipo, titulo, cuerpo, codigo FROM secciones WHERE tema_id = ? ORDER BY id_seccion",
            (tema_id,),
        ).fetchall()
        return [
            {
                "id": r[0],
                "id_seccion": r[1],
                "tipo": r[2],
                "titulo": r[3],
                "cuerpo": r[4],
                "codigo": r[5],
            }
            for r in rows
        ]

    def get_secciones_by_language_and_level(self, language: str, level: str):
        rows = self.conn.execute(
            "SELECT id, curso, nivel, id_capitulo, titulo_capitulo FROM temas WHERE curso = ? AND nivel = ? ORDER BY id_capitulo",
            (language, level),
        ).fetchall()
        result = []
        for r in rows:
            tema = {
                "id": r[0],
                "curso": r[1],
                "nivel": r[2],
                "id_capitulo": r[3],
                "titulo_capitulo": r[4],
                "secciones": self._get_secciones_for_tema(r[0]),
            }
            result.append(tema)
        return result

    def get_user_learning_content(self, username: str):
        diag = self.get_diagnostic_results(username)
        if not diag:
            return None
        latest = diag[0]
        language_key = latest["result"]
        lang_map = {"python": "Python", "cpp": "C++", "java": "Java"}
        language = lang_map.get(language_key, language_key)
        score_key = f"{language_key}_score"
        score = latest.get(score_key, 0)
        max_scores = {"python": 11, "cpp": 10, "java": 9}
        max_score = max_scores.get(language_key, 10)
        diff_raw = latest.get("difficulty_responses", "[]")
        try:
            diff_responses = (
                json.loads(diff_raw) if isinstance(diff_raw, str) else diff_raw
            )
        except (json.JSONDecodeError, TypeError):
            diff_responses = []
        easy_count = sum(1 for r in diff_responses if r == "fácil")
        if diff_responses and easy_count > len(diff_responses) / 2:
            level = "Intermedio"
        else:
            level = "Básico"
        chapters = self.get_secciones_by_language_and_level(language, level)
        return {
            "language": language_key,
            "level": level,
            "score": score,
            "max_score": max_score,
            "chapters": chapters,
        }

    def get_questions(self):
        rows = self.conn.execute(
            "SELECT number, text, language, yes_next, no_next FROM questions ORDER BY number"
        ).fetchall()
        return [
            {
                "number": r[0],
                "text": r[1],
                "language": r[2],
                "yes_next": r[3],
                "no_next": r[4],
            }
            for r in rows
        ]

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

    def save_diagnostic_result(
        self,
        username: str,
        result: str,
        python_score: int,
        cpp_score: int,
        java_score: int,
        difficulty_responses: list | None = None,
    ) -> bool:
        try:
            if difficulty_responses is None:
                difficulty_responses = []
            diff_json = json.dumps(difficulty_responses)
            self.conn.execute(
                "INSERT INTO diagnostic_results (username, result, python_score, cpp_score, java_score, difficulty_responses) VALUES (?, ?, ?, ?, ?, ?)",
                (username, result, python_score, cpp_score, java_score, diff_json),
            )
            self.conn.commit()
            return True
        except Exception:
            return False

    def get_diagnostic_results(self, username: str):
        rows = self.conn.execute(
            "SELECT result, python_score, cpp_score, java_score, difficulty_responses, created FROM diagnostic_results WHERE username = ? ORDER BY created DESC",
            (username,),
        ).fetchall()
        return [
            {
                "result": r[0],
                "python_score": r[1],
                "cpp_score": r[2],
                "java_score": r[3],
                "difficulty_responses": r[4],
                "created": r[5],
            }
            for r in rows
        ]


_db_instance = None


def get_db():
    global _db_instance
    if _db_instance is None:
        _db_instance = b2()
    return _db_instance
