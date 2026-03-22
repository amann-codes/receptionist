"""
Single-user JWT auth — no passlib/bcrypt dependency.
Uses stdlib hmac + hashlib (sha256) for password comparison.

Login:  POST /auth/login  →  { access_token, token_type }
Guard:  Depends(require_auth)  →  returns username string
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
import hashlib, hmac, os

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from pydantic import BaseModel

# ─── Config ────────────────────────────────────────────────────────────────────
JWT_SECRET  = os.getenv("JWT_SECRET", "insecure-dev-secret-change-me")
ALGORITHM   = os.getenv("JWT_ALGORITHM", "HS256")
EXPIRE_MINS = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

DASHBOARD_USERNAME = os.getenv("DASHBOARD_USERNAME", "admin")
DASHBOARD_PASSWORD = os.getenv("DASHBOARD_PASSWORD", "admin")


# ─── Password check (stdlib only, no bcrypt/passlib) ──────────────────────────
def _hash_pw(password: str) -> str:
    """SHA-256 hex digest — good enough for a single-user dashboard."""
    return hashlib.sha256(password.encode()).hexdigest()

def _verify_pw(plain: str, hashed: str) -> bool:
    """Constant-time comparison to prevent timing attacks."""
    return hmac.compare_digest(_hash_pw(plain), hashed)

# Pre-compute hash of the configured password once at import time
_PW_HASH = _hash_pw(DASHBOARD_PASSWORD)


# ─── Pydantic models ───────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ─── JWT helpers ───────────────────────────────────────────────────────────────
def create_access_token(subject: str) -> str:
    expire  = datetime.now(timezone.utc) + timedelta(minutes=EXPIRE_MINS)
    payload = {"sub": subject, "exp": expire, "iat": datetime.now(timezone.utc)}
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)

def decode_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        sub: str = payload.get("sub")
        if not sub:
            raise ValueError("missing sub")
        return sub
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


# ─── FastAPI auth dependency ───────────────────────────────────────────────────
_bearer = HTTPBearer(auto_error=False)

def require_auth(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> str:
    if creds is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return decode_token(creds.credentials)


# ─── Router ────────────────────────────────────────────────────────────────────
auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):
    username_ok = hmac.compare_digest(body.username, DASHBOARD_USERNAME)
    password_ok = _verify_pw(body.password, _PW_HASH)

    if not (username_ok and password_ok):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    return TokenResponse(access_token=create_access_token(body.username))

@auth_router.get("/me")
def me(user: str = Depends(require_auth)):
    return {"username": user}