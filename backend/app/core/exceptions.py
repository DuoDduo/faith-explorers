from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class NotFoundError(Exception):
    """Raised by services when a requested resource doesn't exist (mapped to HTTP 404)."""

    def __init__(self, resource: str) -> None:
        super().__init__(f"{resource} not found")
        self.resource = resource


class ConflictError(Exception):
    """Raised when a write would violate a uniqueness rule (mapped to HTTP 409)."""


class PermissionDeniedError(Exception):
    """Raised when the current user may not perform an action (mapped to HTTP 403)."""


class InvalidInputError(Exception):
    """A request field failed a business rule (mapped to 422, shaped like FastAPI's own)."""

    def __init__(self, field: str, message: str) -> None:
        super().__init__(message)
        self.field = field
        self.message = message


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(NotFoundError)
    async def not_found(_: Request, exc: NotFoundError) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    @app.exception_handler(ConflictError)
    async def conflict(_: Request, exc: ConflictError) -> JSONResponse:
        return JSONResponse(status_code=409, content={"detail": str(exc)})

    @app.exception_handler(PermissionDeniedError)
    async def forbidden(_: Request, exc: PermissionDeniedError) -> JSONResponse:
        return JSONResponse(status_code=403, content={"detail": str(exc)})

    @app.exception_handler(InvalidInputError)
    async def invalid_input(_: Request, exc: InvalidInputError) -> JSONResponse:
        detail = [{"loc": ["body", exc.field], "msg": exc.message, "type": "value_error"}]
        return JSONResponse(status_code=422, content={"detail": detail})
