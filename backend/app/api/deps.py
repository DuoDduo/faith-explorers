from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Role, User
from app.services import auth as auth_service

DbSession = Annotated[Session, Depends(get_db)]

_bearer = HTTPBearer(auto_error=False)
BearerToken = Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)]


def get_token(credentials: BearerToken) -> str:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not signed in",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return credentials.credentials


def get_current_user(db: DbSession, token: Annotated[str, Depends(get_token)]) -> User:
    user = auth_service.user_for_token(db, token)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_optional_user(db: DbSession, credentials: BearerToken) -> User | None:
    """The signed-in user, or None for anonymous or expired sessions (never raises)."""
    if credentials is None:
        return None
    return auth_service.user_for_token(db, credentials.credentials)


SessionToken = Annotated[str, Depends(get_token)]
CurrentUser = Annotated[User, Depends(get_current_user)]
OptionalUser = Annotated[User | None, Depends(get_optional_user)]


def get_current_writer(user: CurrentUser) -> User:
    if user.role not in (Role.AUTHOR, Role.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only authors can do this. Apply to become an author first.",
        )
    return user


CurrentWriter = Annotated[User, Depends(get_current_writer)]
