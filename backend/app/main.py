import logging

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.startup import check_production_settings

SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
}


def create_app() -> FastAPI:
    # Application logs (including emails printed by the console backend) at INFO level.
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    check_production_settings(settings)

    # Interactive docs are handy in development but not needed on the public API.
    docs = not settings.is_production
    app = FastAPI(
        title="Faith Explorers API",
        version="0.1.0",
        docs_url="/docs" if docs else None,
        redoc_url="/redoc" if docs else None,
        openapi_url="/openapi.json" if docs else None,
    )

    @app.middleware("http")
    async def security_headers(request: Request, call_next) -> Response:
        response = await call_next(request)
        for name, value in SECURITY_HEADERS.items():
            response.headers.setdefault(name, value)
        return response

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    register_exception_handlers(app)
    app.include_router(api_router)

    settings.media_dir.mkdir(parents=True, exist_ok=True)
    app.mount(settings.media_url, StaticFiles(directory=settings.media_dir), name="media")
    return app


app = create_app()
