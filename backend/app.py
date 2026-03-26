#!/usr/bin/env python3
import hashlib
import subprocess
import tempfile
from typing import Optional

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from x2 import get_db

app = FastAPI(title="SBC API", version="0.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginReq(BaseModel):
    username: str
    password: str


class RegisterReq(BaseModel):
    username: str
    password: str


class DiagnosticResultReq(BaseModel):
    username: str
    result: str
    python_score: int
    cpp_score: int
    java_score: int
    difficulty_responses: list = []


class ExecuteReq(BaseModel):
    code: str
    language: str = "python"


class Response(BaseModel):
    success: bool
    token: Optional[str] = None
    data: Optional[dict] = None
    error: Optional[str] = None


@app.post("/api/v1/login", response_model=Response)
async def login(data: LoginReq):
    db = get_db()

    if db.verify(data.username, data.password):
        token = hashlib.sha256(
            f"{data.username}:{data.password}:SBCv2".encode()
        ).hexdigest()

        return Response(success=True, token=token, data={"username": data.username})

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales invalidas"
    )


@app.post("/api/v1/register", response_model=Response)
async def register(data: RegisterReq):
    db = get_db()

    if db.add(data.username, data.password):
        return Response(success=True, data={"username": data.username})

    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT, detail="Usuario ya existe"
    )


@app.get("/api/v1/questions")
async def get_questions():
    db = get_db()
    return {"success": True, "data": db.get_questions()}


@app.post("/api/v1/diagnostic-result", response_model=Response)
async def save_diagnostic_result(data: DiagnosticResultReq):
    db = get_db()
    if db.save_diagnostic_result(
        data.username,
        data.result,
        data.python_score,
        data.cpp_score,
        data.java_score,
        difficulty_responses=data.difficulty_responses,
    ):
        return Response(success=True, data={"username": data.username})
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Error al guardar resultado",
    )


@app.get("/api/v1/diagnostic-results/{username}", response_model=Response)
async def get_diagnostic_results(username: str):
    db = get_db()
    results = db.get_diagnostic_results(username)
    return Response(success=True, data=results)


@app.get("/api/v1/content/user/{username}")
async def get_user_content(username: str):
    db = get_db()
    content = db.get_user_learning_content(username)
    if content is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró resultado diagnóstico. Realiza el examen primero.",
        )
    return {"success": True, "data": content}


@app.get("/api/v1/content/{language}")
async def get_content_by_language(language: str):
    db = get_db()
    content = db.get_temas_by_language(language)
    return {"success": True, "data": content}


@app.get("/api/v1/content/{language}/{level}")
async def get_content_by_language_and_level(language: str, level: str):
    db = get_db()
    content = db.get_secciones_by_language_and_level(language, level)
    return {"success": True, "data": content}


@app.post("/api/v1/execute")
async def execute_code(data: ExecuteReq):
    try:
        if data.language == "python":
            with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
                f.write(data.code)
                f.flush()
                result = subprocess.run(
                    ["python3", f.name],
                    capture_output=True,
                    text=True,
                    timeout=10,
                )
        elif data.language == "java":
            with tempfile.TemporaryDirectory() as tmpdir:
                import re

                class_match = re.search(r"public\s+class\s+(\w+)", data.code)
                class_name = class_match.group(1) if class_match else "Main"
                java_file = f"{tmpdir}/{class_name}.java"
                with open(java_file, "w") as f:
                    f.write(data.code)
                compile_result = subprocess.run(
                    ["javac", java_file],
                    capture_output=True,
                    text=True,
                    timeout=10,
                )
                if compile_result.returncode != 0:
                    return {
                        "success": True,
                        "data": {"output": "", "error": compile_result.stderr},
                    }
                result = subprocess.run(
                    ["java", "-cp", tmpdir, class_name],
                    capture_output=True,
                    text=True,
                    timeout=10,
                )
        elif data.language == "cpp":
            with tempfile.TemporaryDirectory() as tmpdir:
                cpp_file = f"{tmpdir}/main.cpp"
                out_file = f"{tmpdir}/main"
                with open(cpp_file, "w") as f:
                    f.write(data.code)
                compile_result = subprocess.run(
                    ["g++", "-o", out_file, cpp_file],
                    capture_output=True,
                    text=True,
                    timeout=10,
                )
                if compile_result.returncode != 0:
                    return {
                        "success": True,
                        "data": {"output": "", "error": compile_result.stderr},
                    }
                result = subprocess.run(
                    [out_file],
                    capture_output=True,
                    text=True,
                    timeout=10,
                )
        else:
            return {
                "success": True,
                "data": {
                    "output": "",
                    "error": f"Lenguaje no soportado: {data.language}",
                },
            }
        output = result.stdout
        error = result.stderr if result.returncode != 0 else None
        return {"success": True, "data": {"output": output, "error": error}}
    except subprocess.TimeoutExpired:
        return {
            "success": True,
            "data": {"output": "", "error": "Tiempo de ejecución excedido (10s)"},
        }
    except Exception as e:
        return {"success": True, "data": {"output": "", "error": str(e)}}


@app.get("/api/v1/hc")
async def health():
    return {"status": True}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8003)
