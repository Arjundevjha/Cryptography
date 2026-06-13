# Analysis Report: CORS Middleware RuntimeError & Fix Strategy

## 1. Root Cause Analysis of the CORS Middleware RuntimeError

In `/Users/abc/Desktop/Cryptography/web/api/main.py` (lines 16-22), the CORS middleware is configured as follows:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

When the FastAPI application starts, it instantiates the Starlette `CORSMiddleware`. During initialization, Starlette validates the CORS configuration parameters. Specifically, the following check is executed:

```python
if "*" in allow_origins and allow_credentials:
    raise RuntimeError("allow_origins cannot be ['*'] when allow_credentials is True")
```

### Why does Starlette enforce this restriction?
1. **Security / Browser CORS Policy**: Under the W3C CORS specification, if a browser sends a request with credentials (such as cookies, authorization headers, or TLS client certificates) using `xhr.withCredentials = true` or `fetch(..., { credentials: 'include' })`, the server's response **must** specify an explicit origin in the `Access-Control-Allow-Origin` header. It cannot return `*` (wildcard). If the server does return `*`, the browser will block the response for security reasons.
2. **FastAPI Fail-Fast Design**: To prevent developers from deploying broken or insecure configurations, Starlette raises a `RuntimeError` on application startup if `allow_origins` is `["*"]` while `allow_credentials` is `True`.

Because of this runtime exception, any attempt to run the FastAPI app (or run backend tests that import `app` from `api.main`) results in an immediate crash.

---

## 2. Robust Fix Strategy

To resolve this issue without losing the required input length verification and Next.js proxy configs, we recommend the following strategies.

### A. Core Strategy: Adjust CORS Settings based on Credentials Need

We have two viable approaches depending on whether credentials (cookies/authorization headers) are actually needed:

#### Option 1: Disable Credentials (Recommended)
Since the Cryptography Museum API (e.g. encrypting, decrypting, generating keys) is entirely stateless and does not use cookies, sessions, or credential-based authentication, setting `allow_credentials=False` is the cleanest and most robust solution. This allows keeping `allow_origins=["*"]` which simplifies local development.

**Code Change Proposal in `web/api/main.py`**:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # Changed from True to False
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Option 2: Specify Allowed Origins
If credentials are required (or if we want to follow stricter security guidelines), we must replace the wildcard origin `*` with the explicit list of allowed origins, such as the Next.js frontend origin.

**Code Change Proposal in `web/api/main.py`**:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
*(Alternatively, origins could be loaded from an environment variable like `ALLOWED_ORIGINS` to keep production settings flexible.)*

---

## 3. Retaining Required Components

### A. Next.js Proxy configuration (`next.config.js`)
The existing Next.js proxy configuration is as follows:
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
This config must be preserved because it proxies client-side requests from `http://localhost:3000/api/...` to the FastAPI backend running at `http://127.0.0.1:8000/api/...`.
- **Note**: Because of this proxy rewrite, all client requests are technically same-origin requests from the browser's perspective. Thus, the client does not rely on cross-origin requests, making either Option 1 or Option 2 fully compatible with the frontend proxy setup.

### B. Input Length Verification
The current input validation handler in `web/api/main.py` checks for `string_too_long` or `value_error.any_str.max_length` and returns an HTTP 400 Bad Request with a custom detail message when input exceeds 500 characters.
We must keep this intact:
```python
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
And the schema check:
```python
class CipherInput(BaseModel):
    text: str = Field(..., max_length=500, description="The input text to process (max 500 chars)")
```
Our fix strategy specifically modifies only the arguments in `app.add_middleware(CORSMiddleware, ...)` and leaves the exception handler and input schemas completely untouched.
