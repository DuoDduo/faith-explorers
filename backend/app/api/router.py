from fastapi import APIRouter

from app.api.routes import categories, comments, contact, health, newsletter, posts

api_router = APIRouter(prefix="/api")
for module in (health, posts, categories, comments, contact, newsletter):
    api_router.include_router(module.router)
