from fastapi import APIRouter

from app.api.routes import (
    admin,
    auth,
    authoring,
    authors,
    categories,
    comments,
    contact,
    health,
    me,
    newsletter,
    posts,
)

api_router = APIRouter(prefix="/api")
for module in (
    health,
    auth,
    authoring,
    me,
    admin,
    posts,
    authors,
    categories,
    comments,
    contact,
    newsletter,
):
    api_router.include_router(module.router)
