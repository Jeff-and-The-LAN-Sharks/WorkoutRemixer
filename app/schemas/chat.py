from sqlmodel import SQLModel
from typing import Optional


class ChatMessage(SQLModel):
    role: str
    content: str


class ChatRequest(SQLModel):
    messages: list[ChatMessage]
    exercise_context: Optional[str] = None


class LoginRequest(SQLModel):
    username: str
    password: str
