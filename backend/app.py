#!/usr/bin/env python3
import hashlib
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


@app.get("/api/v1/hc")
async def health():
    return {"status": True}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8003)
