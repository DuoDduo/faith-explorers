from fastapi import APIRouter, HTTPException, Response, status

from app.api.deps import ClientIP, CurrentUser, DbSession, SessionToken
from app.core import rate_limit
from app.core.rate_limit import limiter
from app.models import User
from app.schemas import AuthOut, LoginIn, RegisterIn, UserOut
from app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


def _signed_in(db: DbSession, user: User) -> AuthOut:
    token, expires_at = auth_service.create_session(db, user)
    return AuthOut(user=UserOut.model_validate(user), token=token, expires_at=expires_at)


@router.post("/register", response_model=AuthOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterIn, db: DbSession, ip: ClientIP) -> AuthOut:
    limiter.consume(f"register:{ip}", rate_limit.REGISTER_PER_IP)
    return _signed_in(db, auth_service.register(db, payload))


@router.post("/login", response_model=AuthOut)
def login(payload: LoginIn, db: DbSession, ip: ClientIP) -> AuthOut:
    limiter.consume(f"login:ip:{ip}", rate_limit.LOGIN_PER_IP)
    # Failed attempts are also counted per account, which stops password guessing
    # spread across many IP addresses.
    account_key = f"login:email:{payload.email.lower()}"
    limiter.check(account_key, rate_limit.LOGIN_FAILURES_PER_EMAIL)
    user = auth_service.authenticate(db, payload.email, payload.password)
    if user is None:
        limiter.hit(account_key, rate_limit.LOGIN_FAILURES_PER_EMAIL)
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return _signed_in(db, user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(token: SessionToken, db: DbSession) -> Response:
    auth_service.revoke_session(db, token)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me", response_model=UserOut)
def me(user: CurrentUser) -> User:
    return user
