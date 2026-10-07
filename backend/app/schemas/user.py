from pydantic import BaseModel, EmailStr
from typing import Optional


class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "guest"
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "guest"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
