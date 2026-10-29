import hashlib
import secrets

from pwdlib import PasswordHash

_hasher = PasswordHash.recommended()  # argon2id

# Verified against when an email isn't registered, so a failed login takes the same
# time whether or not the account exists.
_DUMMY_HASH = _hasher.hash(secrets.token_urlsafe(16))


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str | None) -> bool:
    if password_hash is None:
        _hasher.verify(password, _DUMMY_HASH)
        return False
    return _hasher.verify(password, password_hash)


def new_session_token() -> str:
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    """Only a hash of each session token is stored, so a database leak can't be replayed."""
    return hashlib.sha256(token.encode()).hexdigest()
