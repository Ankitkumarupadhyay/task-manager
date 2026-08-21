from typing import Any, Optional
from fastapi.responses import JSONResponse


def success_response(data: Any, message: str = "Success", status_code: int = 200) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"message": message, "data": data},
    )


def error_response(detail: str, status_code: int = 400) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"detail": detail},
    )
