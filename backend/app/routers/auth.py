import hashlib
import hmac
import secrets

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal, get_db
from app.models.user import User
from app.schemas.user import LoginRequest, RegisterRequest, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def _hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 310_000)
    return f"pbkdf2_sha256${salt.hex()}${digest.hex()}"


def _verify_password(password: str, stored: str | None) -> bool:
    if not stored:
        return False
    try:
        algorithm, salt_hex, digest_hex = stored.split("$", 2)
        if algorithm != "pbkdf2_sha256":
            return False
        expected = bytes.fromhex(digest_hex)
        actual = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt_hex), 310_000)
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


@router.post("/register", response_model=UserResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if len(payload.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")
    role = payload.role.strip().lower()
    if role not in {"guest", "host"}:
        raise HTTPException(status_code=422, detail="Account type must be guest or host")
    email = str(payload.email).strip().lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = User(name=payload.name.strip(), email=email, role=role, password_hash=_hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=UserResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == str(payload.email).strip().lower()).first()
    if not user or not _verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email or password is incorrect")
    return user


def ensure_demo_accounts() -> None:
    """Give the seeded demonstration profiles known passwords without replacing real user data."""
    demo_accounts = (
        ("Aarav Sharma", "aarav.host@example.com", "host", "Host1234!", "https://i.pravatar.cc/150?img=12"),
        ("Ashi", "ashi@example.com", "guest", "Guest1234!", "https://i.pravatar.cc/150?img=32"),
    )
    db = SessionLocal()
    try:
        for name, email, role, password, avatar in demo_accounts:
            user = db.query(User).filter(User.email == email).first()
            if user is None:
                user = User(name=name, email=email, role=role, avatar_url=avatar, password_hash=_hash_password(password))
                db.add(user)
            elif not user.password_hash:
                user.password_hash = _hash_password(password)
        db.commit()
    finally:
        db.close()


@router.post("/become-host/{user_id}", response_model=UserResponse)
def become_host(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Account not found")
    user.role = "host"
    db.commit()
    db.refresh(user)
    return user
