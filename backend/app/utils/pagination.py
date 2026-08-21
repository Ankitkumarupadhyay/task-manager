import math
from typing import TypeVar, Generic, List
from pydantic import BaseModel

T = TypeVar("T")


def paginate(total: int, page: int, limit: int) -> dict:
    total_pages = math.ceil(total / limit) if total > 0 else 1
    return {
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages,
    }


def get_offset(page: int, limit: int) -> int:
    return (page - 1) * limit
