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
        role = db.get_user_role(data.username) or "student"

        return Response(
            success=True, token=token, data={"username": data.username, "role": role}
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales invalidas"
    )


@app.post("/api/v1/register", response_model=Response)
async def register(data: RegisterReq):
    db = get_db()

    if db.add(data.username, data.password):
        role = db.get_user_role(data.username) or "student"
        return Response(success=True, data={"username": data.username, "role": role})

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


@app.get("/api/v1/user/profile")
async def get_user_profile(username: str):
    db = get_db()
    user = db.get(username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    role = db.get_user_role(username) or "student"
    diagnostics = db.get_diagnostic_results(username)

    # Calculate stats from diagnostics
    total_diagnostics = len(diagnostics)
    total_score = 0
    max_possible = 0
    score_map = {"python": "python_score", "cpp": "cpp_score", "java": "java_score"}
    max_scores = {"python": 11, "cpp": 10, "java": 9}

    for d in diagnostics:
        result = d.get("result", "python")
        score_key = score_map.get(result, "python_score")
        total_score += d.get(score_key, 0)
        max_possible += max_scores.get(result, 10)

    accuracy = round((total_score / max_possible * 100)) if max_possible > 0 else 0

    # Get user content for lessons completed
    user_content = db.get_user_learning_content(username)
    lessons_completed = 0
    total_lessons = 0
    if user_content:
        total_lessons = len(user_content.get("chapters", []))
        # For now, count chapters as lessons; progress tracking would need a separate table
        lessons_completed = 0  # Would need a progress tracking table

    # Calculate XP from diagnostics and activity
    xp = total_diagnostics * 100 + lessons_completed * 50
    level = (xp // 300) + 1
    xp_to_next = level * 300

    return {
        "success": True,
        "data": {
            "username": username,
            "role": role,
            "join_date": user.get("created"),
            "total_diagnostics": total_diagnostics,
            "accuracy": accuracy,
            "lessons_completed": lessons_completed,
            "total_lessons": total_lessons,
            "xp": xp,
            "level": level,
            "xp_to_next": xp_to_next,
            "diagnostics": diagnostics,
            "user_content": user_content,
        },
    }


class AnnotationReq(BaseModel):
    expert_username: str
    student_username: str
    annotation: str
    diagnostic_id: Optional[int] = None


class AnnotationUpdateReq(BaseModel):
    annotation: str


@app.get("/api/v1/expert/students")
async def get_students(expert_username: str):
    db = get_db()
    if not db.is_expert(expert_username):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: se requiere rol de experto",
        )
    students = db.get_all_students_with_diagnostics()
    return {"success": True, "data": students}


@app.get("/api/v1/expert/student/{username}/diagnostics")
async def get_student_diagnostics(username: str, expert_username: str):
    db = get_db()
    if not db.is_expert(expert_username):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: se requiere rol de experto",
        )
    diagnostics = db.get_diagnostic_results_with_id(username)
    return {"success": True, "data": diagnostics}


@app.post("/api/v1/expert/annotation", response_model=Response)
async def create_annotation(data: AnnotationReq):
    db = get_db()
    if not db.is_expert(data.expert_username):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: se requiere rol de experto",
        )
    if db.save_annotation(
        data.expert_username,
        data.student_username,
        data.annotation,
        data.diagnostic_id,
    ):
        return Response(success=True, data={"message": "Anotación guardada"})
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Error al guardar anotación",
    )


@app.put("/api/v1/expert/annotation/{annotation_id}", response_model=Response)
async def update_annotation(
    annotation_id: int, data: AnnotationUpdateReq, expert_username: str
):
    db = get_db()
    if not db.is_expert(expert_username):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: se requiere rol de experto",
        )
    if db.update_annotation(annotation_id, data.annotation):
        return Response(success=True, data={"message": "Anotación actualizada"})
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Error al actualizar anotación",
    )


@app.get("/api/v1/expert/annotations/{student_username}")
async def get_student_annotations(student_username: str, expert_username: str):
    db = get_db()
    if not db.is_expert(expert_username):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: se requiere rol de experto",
        )
    annotations = db.get_annotations_for_student(student_username)
    return {"success": True, "data": annotations}


@app.delete("/api/v1/expert/annotation/{annotation_id}", response_model=Response)
async def delete_annotation(annotation_id: int, expert_username: str):
    db = get_db()
    if not db.is_expert(expert_username):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: se requiere rol de experto",
        )
    if db.delete_annotation(annotation_id):
        return Response(success=True, data={"message": "Anotación eliminada"})
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Error al eliminar anotación",
    )


class PromoteReq(BaseModel):
    admin_username: str
    target_username: str
    new_role: str


@app.post("/api/v1/admin/promote", response_model=Response)
async def promote_user(data: PromoteReq):
    db = get_db()
    if not db.is_expert(data.admin_username):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: se requiere rol de admin",
        )
    try:
        db.conn.execute(
            "UPDATE users SET role = ? WHERE username = ?",
            (data.new_role, data.target_username),
        )
        db.conn.commit()
        return Response(
            success=True,
            data={
                "message": f"Usuario {data.target_username} promovido a {data.new_role}"
            },
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al promover usuario",
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8003)
