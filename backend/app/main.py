import json
import logging
from contextlib import asynccontextmanager
from time import perf_counter
from uuid import uuid4

import httpx
from fastapi import FastAPI, Request, Response

from .api import router
from .config import Settings
from .errors import ApiError, error_response, register_error_handlers
from .supabase import Supabase

logger = logging.getLogger("auticonnect.api")
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter("%(message)s"))
logger.addHandler(handler)
logger.setLevel(logging.INFO)
logger.propagate = False


def create_app(
    settings: Settings | None = None, *, transport: httpx.AsyncBaseTransport | None = None
) -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        async with httpx.AsyncClient(timeout=5.0, transport=transport) as client:
            app.state.supabase = Supabase(settings or Settings.from_environment(), client)
            yield

    app = FastAPI(title="AutiConnect API", version="1.0", lifespan=lifespan)
    register_error_handlers(app)
    app.include_router(router)

    @app.middleware("http")
    async def request_middleware(request: Request, call_next) -> Response:
        request.state.request_id = uuid4().hex
        started = perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            # Avoid writing exception text, which may contain an upstream URL or payload.
            response = error_response(request, ApiError(500, "internal_error", "The request failed."))
        response.headers["X-Request-ID"] = request.state.request_id
        response.headers["Cache-Control"] = "no-store"
        route = request.scope.get("route")
        logger.info(json.dumps({
            "event": "api_request",
            "request_id": request.state.request_id,
            "method": request.method if request.method in {"GET", "PUT", "HEAD", "OPTIONS"} else "OTHER",
            "route": getattr(route, "path", None),
            "status": response.status_code,
            "duration_ms": round((perf_counter() - started) * 1000, 2),
        }))
        return response

    return app


app = create_app()
