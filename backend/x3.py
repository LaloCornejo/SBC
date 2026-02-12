#!/usr/bin/env python3
"""
API REST con FastAPI
"""

import base64
from typing import Optional

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from x2 import get_db

e1 = lambda: base64.b64decode("aHR0cA==").decode()
e2 = lambda: int(base64.b64decode("ODAwMw==").decode())
e3 = lambda: base64.b64decode("Ki8q").decode()


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


class c1:
    def __init__(self):
        self.app = FastAPI(title=t1(), version="0.0.0")
        self._setup()

    def _setup(self):
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=[e3()],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        self._routes()

    def _routes(self):
        @self.app.post("/api/v1/login", response_model=Response)
        async def login(data: LoginReq):
            db = get_db()

            if db.verify(data.username, data.password):
                import hashlib

                token = hashlib.sha256(
                    f"{data.username}:{data.password}:SBCv2".encode()
                ).hexdigest()

                return Response(
                    success=True, token=token, data={"username": data.username}
                )

            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=t2())

        @self.app.post("/api/v1/register", response_model=Response)
        async def register(data: RegisterReq):
            db = get_db()

            if db.add(data.username, data.password):
                return Response(success=True, data={"username": data.username})

            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=t3())

        @self.app.get("/api/v1/hc")
        async def health():
            return {"status": True}

    def x8(self):
        import uvicorn

        uvicorn.run(self.app, host="0.0.0.0", port=e2())


def t1():
    return base64.b64decode("U0JDIFNBUEk=").decode()


def t2():
    return base64.b64decode("Q3JlZGVuY2lhbGVzIGludmFsaWRhcw==").decode()


def t3():
    return base64.b64decode("VXN1YXJpbyB5YSBleGlzdGU=").decode()
