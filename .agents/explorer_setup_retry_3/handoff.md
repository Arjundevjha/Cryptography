# Handoff Report: Milestone 1 Setup Failure Analysis

This handoff report summarizes the analysis of the Milestone 1 setup failure (CORS middleware RuntimeError in `api/main.py`) and outlines the recommended fix strategy for the implementation phase.

---

## 1. Observation

- **CORS Middleware Configuration** in `/Users/abc/Desktop/Cryptography/web/api/main.py` (lines 15-22):
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

- **Validation Exception Handler and Input Length Limit** in `/Users/abc/Desktop/Cryptography/web/api/main.py` (lines 25-38, 40-41):
  ```python
  @app.exception_handler(RequestValidationError)
  async def validation_exception_handler(request: Request, exc: RequestValidationError):
      for error in exc.errors():
          # Check if the error is due to string length constraint
          if error.get("type") in ("string_too_long", "value_error.any_str.max_length") or "500" in str(error.get("msg")):
              return JSONResponse(
                  status_code=status.HTTP_400_BAD_REQUEST,
                  content={"detail": "Input string length exceeds limit of 500 characters."},
              )
      # Default to 400 for any validation errors to be safe and strictly adhere to HTTP 400 Bad Request
      return JSONResponse(
          status_code=status.HTTP_400_BAD_REQUEST,
          content={"detail": exc.errors()},
      )

  class CipherInput(BaseModel):
      text: str = Field(..., max_length=500, description="The input text to process (max 500 chars)")
  ```

- **Next.js Rewrites/Proxy Configuration** in `/Users/abc/Desktop/Cryptography/web/next.config.js` (lines 3-11):
  ```javascript
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:8000/api/:path*',
        },
      ];
    },
  ```

- **Auditor Setup Handoff Report** in `/Users/abc/Desktop/Cryptography/.agents/auditor_setup/handoff.md` (lines 73-77):
  ```
  1. Starlette/FastAPI's built-in CORSMiddleware raises a RuntimeError during instantiation if allow_credentials is set to True while allow_origins includes "*" (representing any origin). The framework explicitly checks:
     if allow_all_origins and allow_credentials:
         raise RuntimeError("allow_origins cannot be ['*'] when allow_credentials is True")
  ```

---

## 2. Logic Chain

1. Starlette/FastAPI's `CORSMiddleware` performs strict validation on initialization. If `allow_credentials` is set to `True` while wildcard origins (`"*"`) are allowed (either through `allow_origins=["*"]` or containing `*`), it raises:
   `RuntimeError: allow_origins cannot be ['*'] when allow_credentials is True` (Observation from Auditor Report).
2. The current configuration in `web/api/main.py` explicitly passes `allow_origins=["*"]` and `allow_credentials=True` (Observation from `api/main.py`).
3. This configuration directly triggers Starlette's safety check on app startup, causing a crash/`RuntimeError` before the app can process any HTTP requests.
4. Consequently, tests (e.g. `web/api/test_main.py` importing `app`) fail to run, and the local dev server cannot execute, leading to the Forensic Audit failure (INTEGRITY VIOLATION).
5. The Next.js rewrite proxy config (Observation from `next.config.js`) forwards client calls to `/api/*` to the backend server. Since the browser interacts with Next.js, this proxy is seen as same-origin, meaning CORS headers are not strictly checked for proxied requests in the browser. However, correct CORS setup is still needed for direct API clients/testing tools.
6. The `RequestValidationError` handler and `CipherInput` validation constraints (Observation from `api/main.py`) function correctly and independently from the CORS middleware stack. Fixing CORS will not disrupt the max length verification.

---

## 3. Caveats

- We did not execute commands locally on the system using `run_command` because terminal permissions time out in this non-interactive subagent environment. However, the Starlette CORS configuration constraint is statically deterministic and will always fail at runtime under python.
- External dependencies and local Python environments are assumed to be standard as listed in `requirements.txt`.

---

## 4. Conclusion

The application startup failure is due to a standard-mandated safety check in Starlette's `CORSMiddleware` rejecting `allow_origins=["*"]` when `allow_credentials=True`. 
This issue can be resolved cleanly without affecting the required Next.js proxy rewrite configuration or the 500-character input validation limits.

### Recommended Fix Strategy:
1. **Change `allow_credentials` to `False`** in `web/api/main.py` (Option A):
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
   *Rationale:* The API is completely stateless (pure math/cryptographic operations) and does not use session cookies or basic auth credentials. Disabling credentials is standard for public/stateless utility APIs.
2. **Alternative (Option B):** If credentials must be allowed, configure `allow_origins` to list the explicit frontend origins (e.g. `["http://localhost:3000", "http://127.0.0.1:3000"]`) instead of the wildcard.

---

## 5. Verification Method

To independently verify the issue and the fix:
1. Run the Python import verification:
   ```bash
   cd /Users/abc/Desktop/Cryptography/web
   python3 -c "import sys; sys.path.insert(0, '.'); from api.main import app"
   ```
   * Expected before fix: Crash with `RuntimeError: allow_origins cannot be ['*'] when allow_credentials is True`.
   * Expected after fix: Clean exit (no output/errors).
2. Run backend unit tests:
   ```bash
   cd /Users/abc/Desktop/Cryptography/web
   pytest
   ```
   * Expected after fix: All tests in `web/api/test_main.py` pass.

---

## Remaining Work

1. Apply the recommended change (Option A or Option B) to `web/api/main.py`.
2. Run the verification commands in the terminal to ensure backend startup and unit tests pass.
3. Proceed to run a workspace lint/snyk check and submit the setup for forensic re-audit.
