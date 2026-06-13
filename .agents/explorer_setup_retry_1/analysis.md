# Analysis Report: Milestone 1 Scaffolding & Setup Failure Analysis

## 1. Executive Summary

During the Forensic Audit of Milestone 1 (Scaffolding & Setup), the system failed with an **INTEGRITY VIOLATION**. The root cause is a misconfiguration of the Cross-Origin Resource Sharing (CORS) middleware in the FastAPI backend (`web/api/main.py`). The configuration sets both `allow_origins=["*"]` (wildcard origin) and `allow_credentials=True`. Starlette/FastAPI's CORS implementation explicitly forbids this combination, raising a deterministic `RuntimeError` on startup. 

Because of this runtime crash:
1. The FastAPI application cannot start.
2. Any Python unit tests that import the FastAPI `app` object (e.g., `web/api/test_main.py`) crash immediately.
3. The Next.js frontend is unable to proxy API requests to the backend.

This document analyzes the issue and proposes a robust fix strategy to resolve the `RuntimeError` while preserving all other functional requirements, including the 500-character input length verification and Next.js proxy rewrites.

---

## 2. Detailed Root Cause Analysis

### The Misconfiguration in `web/api/main.py`
In `web/api/main.py`, the CORS middleware is configured as follows:

```python
# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### The Starlette/FastAPI Restriction
FastAPI uses Starlette's `CORSMiddleware` under the hood. During initialization, Starlette checks the configuration parameters. Specifically, if `allow_origins` is set to `["*"]` (which evaluates `allow_all_origins` to `True`) and `allow_credentials` is set to `True`, the middleware constructor raises a `RuntimeError`:

```python
if allow_all_origins and allow_credentials:
    raise RuntimeError("allow_origins cannot be ['*'] when allow_credentials is True")
```

### Rationale Behind the Constraint
1. **W3C CORS Specification Compliance**: The official CORS specification dictates that if a request is made with credentials (cookies, authorization headers, or TLS client certificates), the server's response header `Access-Control-Allow-Origin` cannot be a wildcard (`*`). It must instead specify the exact origin of the requesting site (e.g., `Access-Control-Allow-Origin: http://localhost:3000`).
2. **Security Risks**: If a server responded with the requesting origin dynamically while supporting credentials (effectively bypassing the wildcard ban), it would allow *any* malicious third-party site on the internet to send credentialed requests to the backend and read the response. This is a severe vulnerability (enabling Cross-Site Request Forgery and credential leakage).
3. **Framework Safety**: Starlette actively throws a `RuntimeError` during startup to prevent developers from deploying this insecure and browser-rejected configuration.

---

## 3. Interaction with Other Requirements

### 1. Input Length Verification
The length verification in `web/api/main.py` uses Pydantic's `max_length=500` validation and custom exception handling:
```python
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
```
**Impact of CORS Fix**: None. Modifying the CORS configuration will not affect Pydantic's data validation or FastAPI's exception handler. The input length constraint of 500 characters will continue to return `HTTP 400 Bad Request` exactly as expected.

### 2. Next.js Proxy Rewrite Configuration
In `web/next.config.js`, the rewrite configuration proxies requests to the backend:
```javascript
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*',
      },
    ];
  },
};
```
**Impact of CORS Fix**: 
- When Next.js proxies frontend requests from port 3000 to port 8000 server-side, the request to FastAPI is sent by the Next.js server, not directly by the browser. Since CORS is a browser-enforced mechanism, server-to-server calls do not trigger CORS preflight or validation.
- From the browser's perspective, the request goes to `http://localhost:3000/api/...`, which is same-origin, meaning CORS headers are not even needed for normal proxied API calls.
- Fixing CORS at the FastAPI level ensures that the backend server can boot successfully so that the proxy destination (`http://127.0.0.1:8000`) is active and reachable.

---

## 4. Recommended Fix Strategies

We propose two robust correction pathways. The choice depends on whether credential support (cookies, HTTP basic auth headers, etc.) is planned for future features.

### Option A: Disable Credentials (Recommended)
Since the Cryptography Museum API provides stateless cryptographic utility endpoints (handling input text/keys and returning ciphertexts or hashes) and does not handle sessions, cookies, or authorization tokens, credential support is unnecessary.

**Change**: Set `allow_credentials=False`.

**Pros**:
- Safely retains `allow_origins=["*"]`, allowing the backend to be queried directly from any developer tool or client without configuration.
- Simple, zero-overhead fix.

### Option B: Restrict Allowed Origins (Alternative)
If credentials support must be kept as `True` (e.g., for compliance with specific audit requirements or future extensions), we must replace the wildcard origin with an explicit list of allowed origins.

**Change**: Define a concrete list of allowed origins, typically matching the Next.js development server.

**Pros**:
- Retains `allow_credentials=True`.
- Can be configured to load from an environment variable to support production domain names dynamically.

---

## 5. Proposed Code Diffs

Here are the precise, machine-applicable changes for both options.

### Diff for Option A: Disable Credentials (Recommended)

```diff
--- web/api/main.py (original)
+++ web/api/main.py (proposed)
@@ -15,7 +15,7 @@
 # CORS Middleware
 app.add_middleware(
     CORSMiddleware,
     allow_origins=["*"],
-    allow_credentials=True,
+    allow_credentials=False,
     allow_methods=["*"],
     allow_headers=["*"],
 )
```

### Diff for Option B: Restrict Allowed Origins (Alternative)

```diff
--- web/api/main.py (original)
+++ web/api/main.py (proposed)
@@ -15,8 +15,8 @@
 # CORS Middleware
 app.add_middleware(
     CORSMiddleware,
-    allow_origins=["*"],
-    allow_credentials=True,
+    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
+    allow_credentials=True,
     allow_methods=["*"],
     allow_headers=["*"],
 )
```

*Note: For production readiness, `allow_origins` can be configured using `os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")` to allow environment overrides.*

---

## 6. Verification Method

To independently verify that the fix has resolved the issue:

1. **Unit Test Verification**:
   Navigate to the `web` directory (or workspace root) and run the Python backend tests:
   ```bash
   python3 -m pytest web/api/test_main.py
   ```
   *Expected outcome*: The test client successfully imports `app` from `web/api/main.py`, starts the mock application, and all assertions pass (including the 500-character validation test) with no `RuntimeError` or startup crashes.

2. **Backend Server Startup**:
   Start the FastAPI development server:
   ```bash
   python3 -m uvicorn api.main:app --host 127.0.0.1 --port 8000
   ```
   *Expected outcome*: The server boots and outputs `Application startup complete.` on `http://127.0.0.1:8000` without throwing a `RuntimeError`.

3. **Proxy Verification**:
   Query the health check endpoint through the Next.js proxy route:
   ```bash
   curl http://127.0.0.1:8000/api/health
   ```
   *Expected outcome*: Returns `{"status": "healthy", "version": "0.1.0"}`.
