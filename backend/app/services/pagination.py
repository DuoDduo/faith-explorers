import math
from collections.abc import Sequence
from typing import Any

from pydantic import BaseModel
from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session
from sqlalchemy.sql.elements import ColumnElement

from app.schemas import Page


def paginate[S: BaseModel](
    db: Session,
    stmt: Select[Any],
    schema: type[S],
    *,
    page: int,
    page_size: int,
    order_by: Sequence[ColumnElement[Any]],
    options: Sequence[Any] = (),
) -> Page[S]:
    """Run `stmt` for one page and wrap the rows as `schema` with paging metadata."""
    total = db.scalar(select(func.count()).select_from(stmt.order_by(None).subquery())) or 0
    rows = db.scalars(
        stmt.order_by(*order_by).offset((page - 1) * page_size).limit(page_size).options(*options)
    ).all()
    return Page[S](
        items=[schema.model_validate(row) for row in rows],
        total=total,
        page=page,
        page_size=page_size,
        pages=max(1, math.ceil(total / page_size)),
    )
