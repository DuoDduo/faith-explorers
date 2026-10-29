from fastapi import APIRouter

from app.api.routes import (
    auth,
    authoring,
    categories,
    comments,
    contact,
    health,
    me,
    newsletter,
    posts,
)

api_router = APIRouter(prefix="/api")
for module in (health, auth, authoring, me, posts, categories, comments, contact, newsletter):
    api_router.include_router(module.router)
