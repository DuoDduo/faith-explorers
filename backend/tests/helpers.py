import re

from app.emails.sender import Email


def link_token(email: Email) -> str:
    """The ?token=… value from the link in an email."""
    match = re.search(r"token=([\w-]+)", email.text)
    assert match, f"no token link in: {email.text}"
    return match.group(1)


def sign_up(client, email: str, password: str = "long enough pw") -> dict[str, str]:
    res = client.post(
        "/api/auth/register",
        json={"name": email.split("@")[0].title(), "email": email, "password": password},
    )
    assert res.status_code == 201, res.text
    return {"Authorization": f"Bearer {res.json()['token']}"}
