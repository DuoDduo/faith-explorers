import pytest

from app.core import rate_limit
from app.core.config import settings
from app.core.rate_limit import RateLimitedError, RateLimiter, Rule


def register(client, email: str, headers=None):
    return client.post(
        "/api/auth/register",
        json={"name": "Reader", "email": email, "password": "long enough pw"},
        headers=headers or {},
    )


def test_failed_logins_lock_the_account_temporarily(client):
    register(client, "ada@example.com")
    for _ in range(rate_limit.LOGIN_FAILURES_PER_EMAIL.limit):
        wrong = client.post(
            "/api/auth/login", json={"email": "ada@example.com", "password": "nope"}
        )
        assert wrong.status_code == 401

    # Even the right password is refused until the window passes.
    locked = client.post(
        "/api/auth/login", json={"email": "ADA@example.com", "password": "long enough pw"}
    )
    assert locked.status_code == 429
    assert int(locked.headers["Retry-After"]) > 0
    assert "Too many attempts" in locked.json()["detail"]


def test_successful_logins_do_not_count_towards_lockout(client):
    register(client, "ada@example.com")
    for _ in range(rate_limit.LOGIN_FAILURES_PER_EMAIL.limit + 2):
        ok = client.post(
            "/api/auth/login", json={"email": "ada@example.com", "password": "long enough pw"}
        )
        assert ok.status_code == 200


def test_sign_ups_are_limited_per_ip(client):
    for i in range(rate_limit.REGISTER_PER_IP.limit):
        assert register(client, f"user{i}@example.com").status_code == 201
    assert register(client, "one-more@example.com").status_code == 429


def test_contact_form_is_limited_per_ip(client):
    message = {"name": "Ada", "email": "ada@example.com", "message": "Hello"}
    for _ in range(rate_limit.CONTACT_PER_IP.limit):
        assert client.post("/api/contact", json=message).status_code == 201
    assert client.post("/api/contact", json=message).status_code == 429


def test_comments_are_limited_per_user(client):
    token = register(client, "ada@example.com").json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    slug = "embracing-a-lifestyle-of-humility"
    for i in range(rate_limit.COMMENTS_PER_USER.limit):
        res = client.post(f"/api/posts/{slug}/comments", json={"body": f"#{i}"}, headers=headers)
        assert res.status_code == 201
    res = client.post(f"/api/posts/{slug}/comments", json={"body": "again"}, headers=headers)
    assert res.status_code == 429


@pytest.fixture
def internal_key(monkeypatch):
    monkeypatch.setattr(settings, "internal_api_key", "s3cret")
    return "s3cret"


def test_forwarded_visitor_ip_is_trusted_only_with_the_internal_key(client, internal_key):
    limit = rate_limit.REGISTER_PER_IP.limit
    trusted = {"X-Internal-Key": internal_key}

    # Each forwarded visitor IP gets its own allowance...
    for i in range(limit):
        headers = {**trusted, "X-Client-IP": "203.0.113.1"}
        assert register(client, f"a{i}@example.com", headers).status_code == 201
    blocked = register(client, "a-extra@example.com", {**trusted, "X-Client-IP": "203.0.113.1"})
    assert blocked.status_code == 429
    other = register(client, "b@example.com", {**trusted, "X-Client-IP": "203.0.113.2"})
    assert other.status_code == 201

    # ...but a spoofed header without the key falls back to the real connection address.
    for i in range(limit):
        spoofed = {"X-Client-IP": f"198.51.100.{i}", "X-Internal-Key": "wrong"}
        assert register(client, f"c{i}@example.com", spoofed).status_code == 201
    spoofed = {"X-Client-IP": "198.51.100.99"}
    assert register(client, "c-extra@example.com", spoofed).status_code == 429


def test_window_resets(monkeypatch):
    clock = [1000.0]
    monkeypatch.setattr(rate_limit.time, "monotonic", lambda: clock[0])
    limiter = RateLimiter()
    rule = Rule(limit=2, window=60)
    limiter.consume("k", rule)
    limiter.consume("k", rule)
    with pytest.raises(RateLimitedError) as exc:
        limiter.consume("k", rule)
    assert exc.value.retry_after == 60

    clock[0] += 30
    with pytest.raises(RateLimitedError) as exc:
        limiter.check("k", rule)
    assert exc.value.retry_after == 30

    clock[0] += 31
    limiter.consume("k", rule)  # new window
