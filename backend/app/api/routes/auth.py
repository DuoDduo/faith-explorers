from fastapi import APIRouter, BackgroundTasks, HTTPException, Response, status

from app.api.deps import ClientIP, CurrentUser, DbSession, SessionToken
from app.core import rate_limit
from app.core.rate_limit import limiter
from app.emails import sender
from app.models import User
from app.schemas import (
    AuthOut,
    LoginIn,
    MessageOut,
    PasswordResetConfirmIn,
    PasswordResetRequestIn,
    RegisterIn,
    UserOut,
)
from app.services import auth as auth_service
from app.services import password_reset

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


@router.post("/password-reset", response_model=MessageOut, status_code=status.HTTP_202_ACCEPTED)
def request_password_reset(
    payload: PasswordResetRequestIn, db: DbSession, ip: ClientIP, background: BackgroundTasks
) -> MessageOut:
    limiter.consume(f"reset:ip:{ip}", rate_limit.PASSWORD_RESET_PER_IP)
    limiter.consume(f"reset:email:{payload.email.lower()}", rate_limit.PASSWORD_RESET_PER_EMAIL)
    email = password_reset.request_reset(db, payload.email)
    if email is not None:
        background.add_task(sender.send, email)
    # Identical reply for unknown addresses, so this can't be used to find accounts.
    return MessageOut(
        detail="If an account uses that email, we've sent a link to reset the password."
    )


@router.post("/password-reset/confirm", response_model=MessageOut)
def confirm_password_reset(
    payload: PasswordResetConfirmIn, db: DbSession, background: BackgroundTasks
) -> MessageOut:
    background.add_task(
        sender.send, password_reset.reset_password(db, payload.token, payload.password)
    )
    return MessageOut(detail="Your password has been changed. Please sign in.")
