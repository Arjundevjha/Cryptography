# Exploration Report: CORS Middleware Startup RuntimeError

## Executive Summary
During the Milestone 1 (Scaffolding & Setup) Forensic Audit, the FastAPI backend failed to start due to a `RuntimeError` raised by Starlette's CORS middleware. The exception occurs because `allow_origins` is set to wildcard `["*"]` while `allow_credentials` is set to `True`, which violates HTTP CORS standards and is explicitly rejected by the framework on startup. A robust fix involves setting `allow_credentials=False` (since the cipher endpoints are stateless) or specifying explicit dev/prod origins.

---

## 1. CORS Middleware Analysis & Runtime Crash Root Cause

### The Problematic Configuration
In `web/api/main.py` (lines 15-22):
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

### Starlette's Internal Check
FastAPI uses Starlette's `CORSMiddleware` under the hood. During middleware initialization (`__init__`), Starlette checks the consistency of the CORS configuration:
```python
allow_all_origins = "*" in allow_origins or allow_origins == ["*"]
...
if allow_all_origins and allow_credentials:
    raise RuntimeError("allow_origins cannot be ['*'] when allow_credentials is True")
```
Because the middleware instantiation occurs immediately when `web/api/main.py` is imported or executed, the entire application crashes on startup with:
`RuntimeError: allow_origins cannot be ['*'] when allow_credentials is True`

### Underlying CORS Specification Design
This restriction is mandated by the W3C/Fetch CORS specification. When a web browser executes a cross-origin HTTP request with credentials enabled (e.g., cookies, HTTP Authorization headers, or TLS client certificates):
1. The client sends `credentials: 'include'`.
2. The server must respond with `Access-Control-Allow-Credentials: true`.
3. Crucially, the server's `Access-Control-Allow-Origin` header **must match the request's exact origin** (e.g. `http://localhost:3000`). It **cannot** be the wildcard `*`.
If a server returns both `Access-Control-Allow-Credentials: true` and `Access-Control-Allow-Origin: *`, standard-compliant browsers will reject the response and throw a network error. To prevent developers from shipping an invalid and insecure configuration, Starlette prevents the server from starting.

---

## 2. Interaction with Next.js Proxy/Rewrites and Input Verification

### Next.js Proxy Config
In `web/next.config.js` (lines 3-10):
```javascript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://127.0.0.1:8000/api/:path*',
    },
  ];
}
```
* **How it works:** When the browser requests `/api/validate` from the Next.js server (e.g., `http://localhost:3000/api/validate`), the browser treats it as a same-origin request. Next.js proxies the request server-to-server to the FastAPI backend at `http://127.0.0.1:8000/api/validate`.
* **CORS Impact:** The browser does not perform CORS preflight checks for this request because it's same-origin to the frontend. The server-to-server hop between Next.js and FastAPI is not subject to browser-enforced CORS policy.
* **Direct Access Impact:** While the proxy bypasses browser-side CORS checks, direct client connections to the FastAPI port (e.g. running external tests, separate mobile apps, or local testing tools that hit `http://127.0.0.1:8000` from another port) will still trigger CORS rules. Thus, a valid CORS middleware configuration is required to support all development and verification flows.

### Input Length Verification Integrity
In `web/api/main.py` (lines 25-38, 40-41):
* **Pydantic Model Constraint:** `CipherInput` defines `text` with `max_length=500`.
* **Validation Exception Handler:** Catching `RequestValidationError` and transforming length/value limit errors to a standard HTTP 400 Bad Request with a message: `"Input string length exceeds limit of 500 characters."`
* **Independence:** The input verification logic runs within the FastAPI routing/validation cycle, whereas CORS runs in the middleware stack wrapper. Fixing the CORS configuration does not alter or bypass the validation logic, ensuring that the 500-character input length limit remains fully functional and verified.

---

## 3. Recommended Fix Strategy

### Option A: Disable Credentials (Highly Recommended)
Since the Cryptography Museum API handles stateless operations (Caesar, Vigenere, AES, SHA-256, etc.) and does not manage session cookies, authentication states, or other credentials, setting `allow_credentials=False` is the most logical, secure, and robust solution. This resolves the `RuntimeError` while keeping wildcard access (`"*"`) open for various client configurations.

#### Proposed Changes in `web/api/main.py`:
```python
# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### Option B: Keep Credentials but Explicitly List Origins
If `allow_credentials=True` is strictly required for other integrations (e.g. third-party cookie handling), we must specify an explicit list of origins. We can make this robust by pulling from an environment variable and falling back to the default Next.js ports in development.

#### Proposed Changes in `web/api/main.py`:
```python
import os

# Get allowed origins from environment variable, fallback to default local ports
raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 4. Verification Method
To verify the fix independently after implementation:
1. Try to import the app or run tests in the `web` folder:
   ```bash
   cd /Users/abc/Desktop/Cryptography/web
   python3 -c "import sys; sys.path.insert(0, '.'); from api.main import app"
   ```
2. **Success Condition:** The application imports successfully without raising any `RuntimeError`.
3. **Input Validation Check:** Send a POST request to `/api/validate` with a string > 500 characters and assert that it returns `HTTP 400 Bad Request`.
