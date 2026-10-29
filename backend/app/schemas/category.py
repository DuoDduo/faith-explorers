from app.schemas.common import ORMModel


class CategoryRef(ORMModel):
    name: str
    slug: str


class CategoryOut(CategoryRef):
    id: int
    description: str | None
    cover_url: str | None
    post_count: int
