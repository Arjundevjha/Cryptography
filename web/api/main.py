"""FastAPI entrypoint for the Cryptography Museum API."""

import ipaddress
import logging
import os
import sys
from urllib.parse import urlparse

# Ensure repository root is in python path to resolve methods package in Vercel serverless environment
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from methods.classical import affine  # noqa: F401 (re-exported for test patches)

from .routers import classical, cryptanalysis, historical, modern
from .routers.classical import validate_polybius_ciphertext, validate_polybius_key  # noqa: F401
from .routers.historical import (  # noqa: F401
    get_enigma_reflector_wiring,
    parse_and_validate_enigma_rings,
    parse_enigma_positions,
    validate_enigma_plugboard,
    validate_enigma_rotors,
)
from .routers.modern import (  # noqa: F401
    AesDecryptInput,
    Sha256Input,
    aes_decrypt_endpoint,
    parse_aes_key,
    sha256_endpoint,
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Cryptography Museum API",
    description="Backend service for Cryptography Museum web application.",
    version="0.1.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)


# ASGI middleware to strip /api/main prefix on Vercel deployments
class VercelPathMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            path = scope.get("path", "")
            if path.startswith("/api/main"):
                scope["path"] = path[len("/api/main"):]
                if "raw_path" in scope:
                    scope["raw_path"] = scope["raw_path"][len("/api/main".encode()):]
        await self.app(scope, receive, send)


app.add_middleware(VercelPathMiddleware)

# CORS Middleware
DEFAULT_ALLOWED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]

_INVALID_ORIGIN_CHARS = frozenset(" \t\r\n<>'\"@;")


def _validate_origin_netloc(netloc: str) -> bool:
    """Validates host and port inside netloc, handling IPv6 literals and port ranges."""
    if netloc.startswith("[") and "]" in netloc:
        ipv6_str = netloc[1:netloc.index("]")]
        try:
            ipaddress.ip_address(ipv6_str)
        except ValueError:
            return False
        netloc = netloc.split("]")[-1]
    if ":" in netloc:
        port_str = netloc.split(":")[-1]
        if not port_str or not port_str.isdigit() or not (1 <= int(port_str) <= 65535):
            return False
    return True


def _check_origin_string_format(origin: str) -> bool:
    """Sanity checks basic string properties of an origin candidate."""
    if not isinstance(origin, str):
        return False
    cleaned = origin.strip()
    if not cleaned or cleaned == "*":
        return False
    return not any(c in _INVALID_ORIGIN_CHARS for c in cleaned)


def is_valid_origin(origin: str) -> bool:
    """Validates if an origin string is a secure, well-formed HTTP/HTTPS origin."""
    if not _check_origin_string_format(origin):
        return False
    origin = origin.strip()
    if origin.endswith("/"):
        origin = origin[:-1]
    try:
        parsed = urlparse(origin)
        if parsed.scheme not in ("http", "https"):
            return False
        if not parsed.netloc or "*" in parsed.netloc:
            return False
        if parsed.path or parsed.params or parsed.query or parsed.fragment:
            return False
        return _validate_origin_netloc(parsed.netloc)
    except ValueError:
        return False
    except Exception as e:
        logger.warning("Unexpected error validating origin '%s': %s", origin, e)
        return False


def parse_allowed_origins(env_str: str | None) -> list[str]:
    """Parses and validates CORS_ALLOWED_ORIGINS from environment string."""
    if not env_str:
        return DEFAULT_ALLOWED_ORIGINS
    origins: list[str] = []
    for item in env_str.split(","):
        item = item.strip()
        if item.endswith("/"):
            item = item[:-1]
        if is_valid_origin(item):
            if item not in origins:
                origins.append(item)
    return origins if origins else DEFAULT_ALLOWED_ORIGINS


allowed_origins = parse_allowed_origins(os.getenv("CORS_ALLOWED_ORIGINS"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept", "Origin", "X-Requested-With"],
)


# Security: Defense-in-depth middleware adding standard HTTP security headers
# to all FastAPI responses
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none'; object-src 'none';"
    response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
    return response


# Custom exception handler for validation errors to return HTTP 400 on limit violation
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    for error in exc.errors():
        if error.get("type") in ("string_too_long", "value_error.any_str.max_length") or "500" in str(error.get("msg")):
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "Input string length exceeds limit of 500 characters."},
            )
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": exc.errors()},
    )


class CipherInput(BaseModel):
    text: str = Field(..., max_length=500, description="The input text to process (max 500 chars)")


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


@app.post("/api/validate")
async def validate_input(data: CipherInput):
    return {"status": "valid", "length": len(data.text)}


app.include_router(classical.router)
app.include_router(historical.router)
app.include_router(modern.router)
app.include_router(cryptanalysis.router)
