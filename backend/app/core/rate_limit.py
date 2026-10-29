"""Fixed-window rate limiting for abuse-prone endpoints (sign-in, sign-up, forms, uploads).

Counters live in process memory, which is right for a single API instance. When the API runs
as several instances, move the counters to a shared store (e.g. Redis) behind the same API.
"""

import hmac
import math
import threading
import time
from dataclasses import dataclass

from fastapi import Request

from app.core.config import settings


@dataclass(frozen=True)
class Rule:
    limit: int
    window: int  # seconds


MINUTE = 60
HOUR = 60 * MINUTE

LOGIN_PER_IP = Rule(20, 15 * MINUTE)
LOGIN_FAILURES_PER_EMAIL = Rule(5, 15 * MINUTE)
REGISTER_PER_IP = Rule(5, HOUR)
CONTACT_PER_IP = Rule(5, HOUR)
NEWSLETTER_PER_IP = Rule(10, HOUR)
COMMENTS_PER_USER = Rule(10, 10 * MINUTE)
UPLOADS_PER_USER = Rule(30, HOUR)
APPLICATIONS_PER_USER = Rule(3, 24 * HOUR)
PASSWORD_RESET_PER_IP = Rule(5, HOUR)
PASSWORD_RESET_PER_EMAIL = Rule(3, HOUR)


class RateLimitedError(Exception):
    def __init__(self, retry_after: int) -> None:
        super().__init__("Too many requests")
        self.retry_after = retry_after


class RateLimiter:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._windows: dict[str, tuple[float, int]] = {}  # key -> (window start, count)

    def _current(self, key: str, rule: Rule, now: float) -> tuple[float, int]:
        start, count = self._windows.get(key, (now, 0))
        if now - start >= rule.window:
            return now, 0
        return start, count

    def check(self, key: str, rule: Rule) -> None:
        """Raise if `key` has used up its allowance, without counting this request."""
        now = time.monotonic()
        with self._lock:
            start, count = self._current(key, rule, now)
            if count >= rule.limit:
                raise RateLimitedError(max(1, math.ceil(start + rule.window - now)))

    def hit(self, key: str, rule: Rule) -> None:
        """Count one request against `key` (call after check, or use consume)."""
        now = time.monotonic()
        with self._lock:
            start, count = self._current(key, rule, now)
            self._windows[key] = (start, count + 1)
            if len(self._windows) > 50_000:
                self._prune(now)

    def consume(self, key: str, rule: Rule) -> None:
        self.check(key, rule)
        self.hit(key, rule)

    def _prune(self, now: float) -> None:
        # Drop windows older than the longest rule so memory stays bounded.
        oldest = 24 * HOUR
        self._windows = {k: v for k, v in self._windows.items() if now - v[0] < oldest}

    def reset(self) -> None:
        with self._lock:
            self._windows.clear()


limiter = RateLimiter()


def client_ip(request: Request) -> str:
    """The visitor's IP. The web server forwards it in X-Client-IP, which we only trust
    when it also sends the shared internal key; otherwise use the connection's address."""
    secret = settings.internal_api_key
    forwarded = request.headers.get("x-client-ip")
    if secret and forwarded:
        sent = request.headers.get("x-internal-key", "")
        if hmac.compare_digest(sent.encode(), secret.encode()):
            return forwarded.strip()
    return request.client.host if request.client else "unknown"
