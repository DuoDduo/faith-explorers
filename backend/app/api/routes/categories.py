from fastapi import APIRouter

from app.api.deps import DbSession
from app.schemas import CategoryOut
from app.services import categories as category_service

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryOut])
def list_categories(db: DbSession) -> list[CategoryOut]:
    return category_service.list_categories(db)


@router.get("/{slug}", response_model=CategoryOut)
def get_category(slug: str, db: DbSession) -> CategoryOut:
    return category_service.get_category(db, slug)
