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
                role TEXT DEFAULT 'student',
                created REAL DEFAULT (unixepoch())
            )
        """)
        # Migración: agregar columna role si no existe
        try:
            self.conn.execute(
                "ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'student'"
            )
        except Exception:
            pass
        
        try:
            self.conn.execute("ALTER TABLE user_ability ADD COLUMN daily_streak INTEGER DEFAULT 0")
        except Exception:
            pass
        try:
            self.conn.execute("ALTER TABLE user_ability ADD COLUMN longest_daily_streak INTEGER DEFAULT 0")
        except Exception:
            pass
        try:
            self.conn.execute("ALTER TABLE user_ability ADD COLUMN last_practice_date TEXT")
        except Exception:
            pass
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
            CREATE TABLE IF NOT EXISTS expert_annotations (
                id INTEGER PRIMARY KEY,
                expert_username TEXT NOT NULL,
                student_username TEXT NOT NULL,
                diagnostic_id INTEGER,
                annotation TEXT NOT NULL,
                created REAL DEFAULT (unixepoch()),
                updated REAL DEFAULT (unixepoch()),
                FOREIGN KEY (expert_username) REFERENCES users(username),
                FOREIGN KEY (student_username) REFERENCES users(username),
                FOREIGN KEY (diagnostic_id) REFERENCES diagnostic_results(id)
            )
        """)
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
                codigo_ejemplo TEXT,
                explicacion_codigo TEXT,
                consejos TEXT,
                errores_comunes TEXT,
                ejercicios TEXT,
                kc_tags TEXT,
                dificultad INTEGER DEFAULT 5,
                tiempo_estimado INTEGER DEFAULT 15,
                prerequisites TEXT,
                FOREIGN KEY (tema_id) REFERENCES temas(id)
            )
        """)
        
        # ============================================
        # STI TABLES - Sistema Tutorial Inteligente
        # ============================================
        
        # User progress per section
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS user_section_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                section_id INTEGER NOT NULL,
                completed INTEGER DEFAULT 0,
                attempts INTEGER DEFAULT 0,
                best_time_seconds INTEGER,
                avg_time_seconds REAL,
                first_attempt_score REAL,
                last_attempt_score REAL,
                hints_used INTEGER DEFAULT 0,
                created_at REAL DEFAULT (unixepoch()),
                updated_at REAL DEFAULT (unixepoch()),
                FOREIGN KEY (username) REFERENCES users(username),
                FOREIGN KEY (section_id) REFERENCES secciones(id),
                UNIQUE(username, section_id)
            )
        """)
        
        # Spaced repetition schedule (SM-2)
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS review_schedule (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                section_id INTEGER NOT NULL,
                next_review REAL NOT NULL,
                interval_days INTEGER DEFAULT 1,
                repetitions INTEGER DEFAULT 0,
                ease_factor REAL DEFAULT 2.5,
                last_quality INTEGER DEFAULT 0,
                created_at REAL DEFAULT (unixepoch()),
                FOREIGN KEY (username) REFERENCES users(username),
                FOREIGN KEY (section_id) REFERENCES secciones(id),
                UNIQUE(username, section_id)
            )
        """)
        
        # User ability (ELO rating) per language
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS user_ability (
                username TEXT NOT NULL,
                language TEXT NOT NULL,
                elo_rating INTEGER DEFAULT 1200,
                total_exercises INTEGER DEFAULT 0,
                correct_exercises INTEGER DEFAULT 0,
                current_streak INTEGER DEFAULT 0,
                longest_streak INTEGER DEFAULT 0,
                daily_streak INTEGER DEFAULT 0,
                longest_daily_streak INTEGER DEFAULT 0,
                last_practice REAL,
                last_practice_date TEXT,
                suggested_level TEXT DEFAULT 'Básico',
                suggested_next_section INTEGER,
                mastery_percentage REAL DEFAULT 0,
                PRIMARY KEY (username, language)
            )
        """)
        
        # Learning sessions
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS learning_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                language TEXT NOT NULL,
                start_time REAL DEFAULT (unixepoch()),
                end_time REAL,
                sections_completed INTEGER DEFAULT 0,
                exercises_attempted INTEGER DEFAULT 0,
                exercises_correct INTEGER DEFAULT 0,
                total_time_seconds INTEGER DEFAULT 0,
                avg_response_time_seconds REAL,
                FOREIGN KEY (username) REFERENCES users(username)
            )
        """)
        
        # Student errors log
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS student_errors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                section_id INTEGER NOT NULL,
                error_type TEXT NOT NULL,
                error_message TEXT,
                code_attempt TEXT,
                created_at REAL DEFAULT (unixepoch()),
                FOREIGN KEY (username) REFERENCES users(username),
                FOREIGN KEY (section_id) REFERENCES secciones(id)
            )
        """)
        
        # ============================================
        # CHATBOT TUTOR - Responses predefinidas
        # ============================================
        
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS chatbot_responses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL,
                keywords TEXT NOT NULL,
                question_pattern TEXT,
                response TEXT NOT NULL,
                language_filter TEXT,
                level_filter TEXT,
                priority INTEGER DEFAULT 0
            )
        """)
        
        self._seed_chatbot_responses()
        
        self._seed_questions()
        self._seed_temas()
        self._seed_expert_user()
        self._seed_sti_data()
        self.conn.commit()

    def _seed_chatbot_responses(self):
        count = self.conn.execute("SELECT COUNT(*) FROM chatbot_responses").fetchone()[0]
        if count > 0:
            return
        
        responses = [
            # FAQ General
            ("faq", "ayuda|help|como|hacer|help me", None, "Estoy aquí para ayudarte. Puedes preguntarme sobre:\n- Errores en tu código\n- Conceptos de programación\n- Cómo resolver ejercicios\n- Tips de estudio", None, None, 10),
            ("faq", "gracias|thank you", None, "¡De nada! Sigue adelante con tu aprendizaje. Si necesitas ayuda, aquí estaré.", None, None, 5),
            ("faq", "hola|hi|hello|buenos dias|buenas", None, "¡Hola! Soy tu asistente de aprendizaje. Pregúntame sobre programación o pide ayuda con tus ejercicios.", None, None, 10),
            ("faq", "adios|bye|nos vemos|exit", None, "¡Hasta luego! Recuerda practicar todos los días. ¡Nos vemos pronto!", None, None, 5),
            
            # Motivación
            ("motivation", "es dificil|no puedo|no entiendo|dificil|hard", None, "No te preocupes, ¡todos empezamos desde cero! Los errores son parte del aprendizaje. Prueba dividir el problema en partes más pequeñas.", None, None, 15),
            ("motivation", "frustrado|frustrated|confundido|confused", None, "La confusión es normal cuando estás aprendiendo algo nuevo. Tómate un descanso y vuelve con calma. Puedo ayudarte a desglosar el concepto.", None, None, 15),
            ("motivation", "cansado|tired|aburrido|bored", None, "¡Cada pequeño progreso cuenta! Si necesitas un impulso, recuerda: estás aprendiendo una habilidad que te abrirá muchas puertas.", None, None, 10),
            ("motivation", "progreso|avance|advance|progress", None, "¡Excelente! Celebra tus logros, por pequeños que sean. Cada línea de código que escribes te hace mejor programador.", None, None, 10),
            ("motivation", "tiempo|tarda|mucho|tiempo", None, "La práctica hace al maestro. Al principio todo parece lento, pero con el tiempo tu código fluirá naturalmente. ¡Sigue así!", None, None, 10),
            
            # Conceptos básicos (Python)
            ("concept", "variable|asignar|guardar|almacenar", None, "En Python, una variable es como una caja donde guardas un valor. Ejemplo: x = 5. El nombre va a la izquierda, el valor a la derecha.", "python", None, 20),
            ("concept", "print|imprimir|mostrar|display", None, "print() muestra texto o variables en la pantalla. Ejemplo: print('Hola mundo') o print(x)", "python", None, 20),
            ("concept", "if|condicion|si entonces", None, "if verifica una condición y ejecuta código si es verdadera. Ejemplo:\nif x > 10:\n    print('Mayor')", "python", None, 20),
            ("concept", "for|loop|bucle|repetir", None, "for repite código varias veces. Ejemplo:\nfor i in range(5):\n    print(i)\nEsto imprime 0,1,2,3,4", "python", None, 20),
            ("concept", "funcion|def|funcion|method", None, "Una función es un bloque de código reutilizable. Ejemplo:\ndef saludar(nombre):\n    return 'Hola ' + nombre", "python", None, 20),
            ("concept", "lista|array|arreglo|list", None, "Una lista guarda múltiples valores. Ejemplo: numeros = [1, 2, 3]. Puedes acceder con numeros[0] para obtener el primer elemento.", "python", None, 25),
            
            # Conceptos C++
            ("concept", "variable|int|float|declara", None, "En C++ debes declarar el tipo de variable. Ejemplo: int edad = 25; float precio = 19.99;", "cpp", None, 20),
            ("concept", "cout|print|imprimir|cout", None, "cout muestra texto en pantalla. Incluye <iostream>. Ejemplo:\ncout << 'Hola mundo';", "cpp", None, 20),
            ("concept", "cin|input|entrada|leer", None, "cin lee datos del teclado. Ejemplo:\nint edad;\ncin >> edad;", "cpp", None, 20),
            ("concept", "for|while|loop|bucle", None, "C++ tiene for y while:\nfor(int i=0; i<10; i++) { }\nwhile(condicion) { }", "cpp", None, 20),
            ("concept", "funcion|void|return", None, "En C++ las funciones pueden ser void (no retornan) o retornar un tipo. Ejemplo:\nvoid saludar() { cout << 'Hola'; }", "cpp", None, 20),
            ("concept", "vector|array|lista", None, "vector es la lista dinámica de C++:\n#include <vector>\nvector<int> nums = {1, 2, 3};", "cpp", None, 25),
            
            # Conceptos Java
            ("concept", "variable|int|String|declara", None, "En Java declaras el tipo. Ejemplo: int edad = 25; String nombre = 'Ana';", "java", None, 20),
            ("concept", "println|print|system.out", None, "System.out.println() muestra texto. Ejemplo:\nSystem.out.println('Hola mundo');", "java", None, 20),
            ("concept", "scanner|input|leer|entrada", None, "Scanner lee del teclado:\nScanner sc = new Scanner(System.in);\nint edad = sc.nextInt();", "java", None, 20),
            ("concept", "for|while|loop|bucle", None, "Java tiene for y while:\nfor(int i=0; i<10; i++) { }\nwhile(condicion) { }", "java", None, 20),
            ("concept", "clase|public|class|poo", None, "Todo en Java está en clases. Ejemplo:\npublic class Main {\n    public static void main(String[] args) { }\n}", "java", None, 25),
            ("concept", "array|arraylist|lista", None, "Array de tamaño fijo:\nint[] numeros = {1, 2, 3};\nArrayList para listas dinámicas.", "java", None, 25),
            
            # Errores comunes
            ("help", "error|error|syntax|indentation", None, "Los errores de sintaxis suelen ser por:\n- Olvidar dos puntos (:) después de if/for\n- Indentación incorrecta (Python requiere espacios)\n- Llaves faltantes ({}) en C++/Java\nRevisa la línea mencionada y las anteriores.", None, None, 30),
            ("help", "null|none|nulo|puntero", None, "Error de null/nulo significa que intentas usar algo que no existe. Verifica:\n- ¿Inicializaste la variable?\n- ¿El objeto existe?\n- ¿La lista tiene elementos?", None, None, 25),
            ("help", "indice|index|out of range|rango", None, "Error de índice: estás accediendo a una posición que no existe. Recuerda que las listas empiezan en 0. Usa len() para saber el tamaño.", None, None, 25),
            ("help", "tipo|type|mismatch|的类型", None, "Error de tipo: estás mezclando tipos diferentes. Por ejemplo, sumar texto + número. Convierte los tipos o usa str() para texto.", None, None, 25),
            ("help", "nombre|name|not defined|no existe", None, "Error de nombre no definido: esa variable o función no existe. Verifica:\n- ¿Está escrita igual?\n- ¿Se definió antes de usarse?\n- ¿Importaste el módulo correcto?", None, None, 25),
            
            # Tips de estudio
            ("motivation", "tip|consejo|sugerencia|advice", None, "Tips de estudio:\n1. Lee el código despacio, línea por línea\n2. Prueba modificar algo pequeño y observa el resultado\n3. Escribe código todos los días, aunque sea poco\n4. Cuando Fallen, revisa la solución y entiende por qué funciona", None, None, 15),
            ("motivation", "practicar|practice|ejercicio|exercise", None, "La mejor forma de aprender programación es practicando. Intenta resolver ejercicios sin mirar las soluciones primero. Si te atoras, pide hints.", None, None, 15),
            ("motivation", "codigo|ejemplo|solucion|answer", None, "Para entender código de ejemplo:\n1. Lee los comentarios\n2. Ejecuta paso a paso\n3. Modifica algo y observa qué cambia\n4. Explica qué hace cada línea en voz alta", None, None, 15),
        ]
        
        for resp in responses:
            self.conn.execute(
                "INSERT INTO chatbot_responses (category, keywords, question_pattern, response, language_filter, level_filter, priority) VALUES (?, ?, ?, ?, ?, ?, ?)",
                resp
            )

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
        self.conn.execute("DELETE FROM secciones")
        self.conn.execute("DELETE FROM temas")
        self.conn.commit()
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
                            sec.get("cuerpo", ""),
                            sec.get("codigo"),
                        ),
                    )
        self.conn.commit()

    def _seed_expert_user(self):
        expert_exists = self.conn.execute(
            "SELECT COUNT(*) FROM users WHERE username = 'expert'"
        ).fetchone()[0]
        if expert_exists == 0:
            hashed = b1.h1("root")
            self.conn.execute(
                "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
                ("expert", hashed, "expert"),
            )
            if HAS_VEC:
                try:
                    self.conn.execute(
                        "INSERT INTO vt_users (username, password) VALUES (?, ?)",
                        ("expert", hashed),
                    )
                except:
                    pass

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

    def get_user_role(self, username: str):
        row = self.conn.execute(
            "SELECT role FROM users WHERE username = ?",
            (username,),
        ).fetchone()
        return row[0] if row else None

    def is_expert(self, username: str):
        role = self.get_user_role(username)
        return role in ("expert", "admin")

    def get_all_students_with_diagnostics(self):
        rows = self.conn.execute("""
            SELECT DISTINCT u.username, u.created,
                   COUNT(d.id) as diagnostic_count,
                   MAX(d.created) as last_diagnostic
            FROM users u
            LEFT JOIN diagnostic_results d ON u.username = d.username
            WHERE u.role = 'student'
            GROUP BY u.username
            ORDER BY last_diagnostic DESC NULLS LAST
        """).fetchall()
        return [
            {
                "username": r[0],
                "created": r[1],
                "diagnostic_count": r[2],
                "last_diagnostic": r[3],
            }
            for r in rows
        ]

    def get_diagnostic_results_with_id(self, username: str):
        rows = self.conn.execute(
            "SELECT id, result, python_score, cpp_score, java_score, difficulty_responses, created FROM diagnostic_results WHERE username = ? ORDER BY created DESC",
            (username,),
        ).fetchall()
        return [
            {
                "id": r[0],
                "result": r[1],
                "python_score": r[2],
                "cpp_score": r[3],
                "java_score": r[4],
                "difficulty_responses": r[5],
                "created": r[6],
            }
            for r in rows
        ]

    def save_annotation(
        self,
        expert_username: str,
        student_username: str,
        annotation: str,
        diagnostic_id: int | None = None,
    ):
        try:
            self.conn.execute(
                "INSERT INTO expert_annotations (expert_username, student_username, diagnostic_id, annotation) VALUES (?, ?, ?, ?)",
                (expert_username, student_username, diagnostic_id, annotation),
            )
            self.conn.commit()
            return True
        except Exception:
            return False

    def update_annotation(self, annotation_id: int, annotation: str):
        try:
            self.conn.execute(
                "UPDATE expert_annotations SET annotation = ?, updated = unixepoch() WHERE id = ?",
                (annotation, annotation_id),
            )
            self.conn.commit()
            return True
        except Exception:
            return False

    def get_annotations_for_student(self, student_username: str):
        rows = self.conn.execute(
            """
            SELECT id, expert_username, student_username, diagnostic_id, annotation, created, updated
            FROM expert_annotations
            WHERE student_username = ?
            ORDER BY updated DESC
        """,
            (student_username,),
        ).fetchall()
        return [
            {
                "id": r[0],
                "expert_username": r[1],
                "student_username": r[2],
                "diagnostic_id": r[3],
                "annotation": r[4],
                "created": r[5],
                "updated": r[6],
            }
            for r in rows
        ]

    def delete_annotation(self, annotation_id: int):
        try:
            self.conn.execute(
                "DELETE FROM expert_annotations WHERE id = ?",
                (annotation_id,),
            )
            self.conn.commit()
            return True
        except Exception:
            return False

    # ============================================
    # STI - Sistema Tutorial Inteligente
    # ============================================

    def _seed_sti_data(self):
        pass

    def get_user_ability(self, username: str, language: str):
        row = self.conn.execute(
            "SELECT elo_rating, total_exercises, correct_exercises, current_streak, longest_streak, last_practice, suggested_level, suggested_next_section, mastery_percentage, daily_streak, longest_daily_streak, last_practice_date FROM user_ability WHERE username = ? AND language = ?",
            (username, language),
        ).fetchone()
        if row:
            return {
                "elo_rating": row[0],
                "total_exercises": row[1],
                "correct_exercises": row[2],
                "current_streak": row[3],
                "longest_streak": row[4],
                "last_practice": row[5],
                "suggested_level": row[6],
                "suggested_next_section": row[7],
                "mastery_percentage": row[8],
                "daily_streak": row[9] or 0,
                "longest_daily_streak": row[10] or 0,
                "last_practice_date": row[11],
            }
        return None

    def update_user_ability(self, username: str, language: str, correct: bool):
        current = self.get_user_ability(username, language)
        now = __import__('time').time()
        today = __import__('datetime').date.today().isoformat()
        
        K_FACTOR = 32
        INITIAL_ELO = 1200
        
        if current:
            elo = current["elo_rating"]
            expected = 1 / (1 + 10 ** ((1500 - elo) / 400))
            new_elo = elo + K_FACTOR * (1 - expected if correct else 0 - expected)
            
            total = current["total_exercises"] + 1
            correct_count = current["correct_exercises"] + (1 if correct else 0)
            new_streak = current["current_streak"] + (1 if correct else 0)
            new_mastery = min(100, (correct_count / max(total, 1)) * 100 + (total - correct_count) * 0.5)
            
            last_date = current.get("last_practice_date")
            if last_date == today:
                daily_streak = current["daily_streak"]
                longest_daily = current["longest_daily_streak"]
            else:
                daily_streak = current["daily_streak"] + 1
                longest_daily = max(current["longest_daily_streak"], daily_streak)
            
            self.conn.execute(
                "UPDATE user_ability SET elo_rating = ?, total_exercises = total_exercises + 1, correct_exercises = correct_exercises + ?, current_streak = ?, longest_streak = MAX(longest_streak, ?), last_practice = ?, mastery_percentage = ?, daily_streak = ?, longest_daily_streak = MAX(longest_daily_streak, ?), last_practice_date = ? WHERE username = ? AND language = ?",
                (int(new_elo), 1 if correct else 0, new_streak, new_streak, now, new_mastery, daily_streak, daily_streak, today, username, language),
            )
        else:
            new_elo = INITIAL_ELO + (K_FACTOR * 0.5 if correct else 0)
            new_mastery = 50.0 if correct else 0.0
            self.conn.execute(
                "INSERT INTO user_ability (username, language, elo_rating, total_exercises, correct_exercises, current_streak, longest_streak, last_practice, suggested_level, mastery_percentage, daily_streak, longest_daily_streak, last_practice_date) VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (username, language, int(new_elo), 1 if correct else 0, 1 if correct else 0, 1 if correct else 0, now, language.lower(), new_mastery, 1, 1, today),
            )
        self.conn.commit()

    def get_section_progress(self, username: str, section_id: int):
        row = self.conn.execute(
            "SELECT completed, attempts, best_time_seconds, avg_time_seconds, first_attempt_score, last_attempt_score, hints_used FROM user_section_progress WHERE username = ? AND section_id = ?",
            (username, section_id),
        ).fetchone()
        if row:
            return {
                "completed": bool(row[0]),
                "attempts": row[1],
                "best_time_seconds": row[2],
                "avg_time_seconds": row[3],
                "first_attempt_score": row[4],
                "last_attempt_score": row[5],
                "hints_used": row[6],
            }
        return None

    def save_section_progress(self, username: str, section_id: int, completed: bool, time_seconds: int, hints_used: int = 0):
        existing = self.get_section_progress(username, section_id)
        
        attempt_score = 1.0 if completed else 0.0
        
        if existing:
            # Only set completed to true, never overwrite true with false
            new_completed = completed or existing.get("completed", False)
            self.conn.execute(
                "UPDATE user_section_progress SET completed = ?, attempts = attempts + 1, best_time_seconds = CASE WHEN ? < best_time_seconds OR best_time_seconds IS NULL THEN ? ELSE best_time_seconds END, avg_time_seconds = (avg_time_seconds * attempts + ?) / (attempts + 1), last_attempt_score = ?, hints_used = hints_used + ?, updated_at = unixepoch() WHERE username = ? AND section_id = ?",
                (new_completed, time_seconds, time_seconds, time_seconds, attempt_score, hints_used, username, section_id),
            )
        else:
            self.conn.execute(
                "INSERT INTO user_section_progress (username, section_id, completed, attempts, best_time_seconds, avg_time_seconds, first_attempt_score, last_attempt_score, hints_used) VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?)",
                (username, section_id, completed, time_seconds, time_seconds, attempt_score, attempt_score, hints_used),
            )
        self.conn.commit()

    def get_review_schedule(self, username: str):
        now = __import__('time').time()
        rows = self.conn.execute(
            "SELECT section_id, next_review, interval_days, repetitions, ease_factor FROM review_schedule WHERE username = ? AND next_review <= ? ORDER BY next_review ASC",
            (username, now),
        ).fetchall()
        return [
            {
                "section_id": r[0],
                "next_review": r[1],
                "interval_days": r[2],
                "repetitions": r[3],
                "ease_factor": r[4],
            }
            for r in rows
        ]

    def update_review_schedule(self, username: str, section_id: int, quality: int):
        now = __import__('time').time()
        
        row = self.conn.execute(
            "SELECT interval_days, repetitions, ease_factor FROM review_schedule WHERE username = ? AND section_id = ?",
            (username, section_id),
        ).fetchone()
        
        if row:
            interval, reps, ease = row
        else:
            interval, reps, ease = 1, 0, 2.5
        
        if quality >= 3:
            if reps == 0:
                new_interval = 1
            elif reps == 1:
                new_interval = 6
            else:
                new_interval = int(interval * ease)
            
            new_reps = reps + 1
            new_ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
            new_ease = max(1.3, new_ease)
        else:
            new_interval = 1
            new_reps = 0
            new_ease = max(1.3, ease - 0.2)
        
        next_review = now + (new_interval * 86400)
        
        if row:
            self.conn.execute(
                "UPDATE review_schedule SET next_review = ?, interval_days = ?, repetitions = ?, ease_factor = ?, last_quality = ? WHERE username = ? AND section_id = ?",
                (next_review, new_interval, new_reps, new_ease, quality, username, section_id),
            )
        else:
            self.conn.execute(
                "INSERT INTO review_schedule (username, section_id, next_review, interval_days, repetitions, ease_factor, last_quality) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (username, section_id, next_review, new_interval, new_reps, new_ease, quality),
            )
        self.conn.commit()

    def get_student_stats(self, username: str):
        progress_rows = self.conn.execute(
            "SELECT COUNT(*) as total, SUM(completed) as done FROM user_section_progress WHERE username = ?",
            (username,),
        ).fetchone()
        
        ability_rows = self.conn.execute(
            "SELECT language, elo_rating, mastery_percentage, current_streak FROM user_ability WHERE username = ?",
            (username,),
        ).fetchall()
        
        stats = {
            "total_sections": progress_rows[0] or 0,
            "completed_sections": progress_rows[1] or 0,
            "languages": {},
            "overall_mastery": 0,
            "total_streak": 0,
        }
        
        if ability_rows:
            total_mastery = 0
            for r in ability_rows:
                lang, elo, mastery, streak = r
                stats["languages"][lang] = {
                    "elo_rating": elo,
                    "mastery_percentage": mastery,
                    "current_streak": streak,
                }
                total_mastery += mastery or 0
                if lang in stats and (stats.get("total_streak", 0) == 0 or streak > stats.get("total_streak", 0)):
                    stats["total_streak"] = streak
            
            if ability_rows:
                stats["overall_mastery"] = total_mastery / len(ability_rows)
        
        return stats

    def start_learning_session(self, username: str, language: str):
        self.conn.execute(
            "INSERT INTO learning_sessions (username, language) VALUES (?, ?)",
            (username, language),
        )
        self.conn.commit()
        return self.conn.execute("SELECT last_insert_rowid()").fetchone()[0]

    def end_learning_session(self, session_id: int, sections_completed: int, exercises_attempted: int, exercises_correct: int, total_time: int):
        now = __import__('time').time()
        avg_time = total_time / exercises_attempted if exercises_attempted > 0 else 0
        
        self.conn.execute(
            "UPDATE learning_sessions SET end_time = ?, sections_completed = ?, exercises_attempted = ?, exercises_correct = ?, total_time_seconds = ?, avg_response_time_seconds = ? WHERE id = ?",
            (now, sections_completed, exercises_attempted, exercises_correct, total_time, avg_time, session_id),
        )
        self.conn.commit()

    def log_student_error(self, username: str, section_id: int, error_type: str, error_message: str, code_attempt: str):
        try:
            self.conn.execute(
                "INSERT INTO student_errors (username, section_id, error_type, error_message, code_attempt) VALUES (?, ?, ?, ?, ?)",
                (username, section_id, error_type, error_message, code_attempt),
            )
            self.conn.commit()
            return True
        except Exception:
            return False

    def get_chatbot_response(self, message: str, language: str | None = None, level: str | None = None, section_title: str | None = None):
        normalized_msg = message.lower().strip()
        words = set(normalized_msg.replace("?", "").replace("!", "").replace(".", "").split())
        
        rows = self.conn.execute(
            """SELECT response, priority, language_filter, level_filter, keywords FROM chatbot_responses""").fetchall()
        
        best_response = None
        best_score = 0
        
        for row in rows:
            response, priority, lang_filter, level_filter, keywords = row
            
            if lang_filter and lang_filter != language and language:
                continue
            if level_filter and level_filter != level and level:
                continue
            
            keyword_list = [k.strip() for k in keywords.split("|")]
            matches = sum(1 for kw in keyword_list if kw in normalized_msg or kw in words)
            
            if matches > 0:
                score = matches * 10 + priority
                if score > best_score:
                    best_score = score
                    best_response = response
        
        if best_score < 10:
            return {
                "response": "No estoy seguro de entender tu pregunta. ¿Podrías reformularla?\n\nTambién puedes preguntarme sobre:\n- Conceptos de programación\n- Errores en tu código\n- Tips de estudio\n- Cómo resolver ejercicios",
                "category": "fallback",
                "confidence": 0,
            }
        
        category_row = self.conn.execute(
            "SELECT category FROM chatbot_responses WHERE response = ? LIMIT 1",
            (best_response,),
        ).fetchone()
        
        return {
            "response": best_response,
            "category": category_row[0] if category_row else "faq",
            "confidence": min(best_score / 50, 1.0),
        }


_db_instance = None


def get_db():
    global _db_instance
    if _db_instance is None:
        _db_instance = b2()
    return _db_instance
