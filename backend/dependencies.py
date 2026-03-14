"""
FastAPI dependency: extract + validate JWT from Authorization header,
return the current user dict so routers can check role.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError

from backend.auth_utils import decode_token
from backend.config import settings

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    if credentials is None:
        if settings.DEV_BYPASS_AUTH:
            return {"id": "dev-user", "role": "MANAGER"}
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
        )

    token = credentials.credentials
    try:
        payload = decode_token(token)
    except JWTError:
        if settings.DEV_BYPASS_AUTH:
            return {"id": "dev-user", "role": "MANAGER"}
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user_id: str = payload.get("sub")
    role: str    = payload.get("role")

    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bad token payload")

    return {"id": user_id, "role": role}


def require_manager(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "MANAGER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Manager role required",
        )
    return current_user
