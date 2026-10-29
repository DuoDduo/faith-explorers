from fastapi import APIRouter

from app.api.deps import DbSession
from app.schemas import AuthorProfile
from app.services import authors as author_service

router = APIRouter(prefix="/authors", tags=["authors"])


@router.get("/{user_id}", response_model=AuthorProfile)
def get_author(user_id: int, db: DbSession) -> AuthorProfile:
    return author_service.get_author(db, user_id)
