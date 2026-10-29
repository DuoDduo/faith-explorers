from app.schemas.common import ORMModel


class AuthorOut(ORMModel):
    id: int
    name: str
    avatar_url: str | None
    bio: str | None
