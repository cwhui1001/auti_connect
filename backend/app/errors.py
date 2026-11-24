from collections.abc import Mapping

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


class ApiError(Exception):
    def __init__(
        self, status: int, code: str, message: str, headers: Mapping[str, str] | None = None
    ) -> None:
        super().__init__(code)
        self.status = status
        self.code = code
        self.message = message
        self.headers = headers


def authentication_required() -> ApiError:
    return ApiError(
        401, "authentication_required", "Sign in to continue.", {"WWW-Authenticate": "Bearer"}
    )


def dependency_unavailable() -> ApiError:
    return ApiError(503, "service_unavailable", "The service is temporarily unavailable.")


def error_response(request: Request, error: ApiError) -> JSONResponse:
    request_id = request.state.request_id
    return JSONResponse(
        status_code=error.status,
        headers={**(error.headers or {}), "X-Request-ID": request_id, "Cache-Control": "no-store"},
        content={"error": {"code": error.code, "message": error.message, "request_id": request_id}},
    )


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    async def handle_api_error(request: Request, error: ApiError) -> JSONResponse:
        return error_response(request, error)

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(request: Request, _: RequestValidationError) -> JSONResponse:
        return error_response(request, ApiError(422, "invalid_request", "Check the submitted values."))

    @app.exception_handler(StarletteHTTPException)
    async def handle_http_error(request: Request, error: StarletteHTTPException) -> JSONResponse:
        messages = {
            404: ("not_found", "This endpoint does not exist."),
            405: ("method_not_allowed", "This method is not allowed."),
        }
        code, message = messages.get(error.status_code, ("request_failed", "The request failed."))
        return error_response(request, ApiError(error.status_code, code, message, error.headers))
