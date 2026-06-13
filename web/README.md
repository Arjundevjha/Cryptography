# Cryptography Museum Web Application

This directory contains the web-based user interface and FastAPI backend for the Cryptography Museum application.

## Prerequisites

To run this application locally, you need the following installed on your system:

- **Node.js**: Version `18.17.0` or later.
- **Python**: Version `3.8` or later.
- **Python Package Manager**: `pip`.
- **System Utilities**: `netcat` (optional, used by scripts to verify ports are active).

## Installation

### 1. Backend Dependencies

Install the required Python libraries using `pip`. It is recommended to use a virtual environment:

```bash
# From the repository root or web/ directory
pip install -r web/requirements.txt
```

The key backend dependencies are:
- `fastapi` (FastAPI web framework)
- `uvicorn` (ASGI web server)
- `pydantic` (Data validation and settings management)
- `pytest` & `httpx` (Backend testing)

### 2. Frontend Dependencies

Install the frontend Node.js packages:

```bash
cd web
npm install
```

### 3. Playwright Browser Binaries (For E2E Testing)

Install the Playwright browser binaries required for end-to-end testing:

```bash
cd web
npx playwright install --with-deps chromium
```

---

## Running the Servers

### 1. Start the FastAPI Backend Server (Port 8000)

The backend server must be started with the repository root in the Python path so it can resolve the cryptographic core modules under `methods/`.

From the **repository root** directory:
```bash
PYTHONPATH=. uvicorn web.api.main:app --host 127.0.0.1 --port 8000 --reload
```

Or by exporting PYTHONPATH:
```bash
export PYTHONPATH=.
uvicorn web.api.main:app --host 127.0.0.1 --port 8000
```

The backend API will be running at `http://127.0.0.1:8000`. You can access the interactive Swagger API documentation at `http://127.0.0.1:8000/api/docs`.

### 2. Start the Next.js Frontend Server (Port 3000)

From the **web/** directory:

*   **Development Mode**:
    ```bash
    npm run dev
    ```
    This starts the Next.js server with hot reloading enabled at `http://127.0.0.1:3000`.

*   **Production Mode**:
    ```bash
    npm run build
    npm run start
    ```
    This compiles the optimized production build and runs it on port 3000.

---

## Running the E2E Test Suite

You can run the end-to-end integration tests using either the consolidated automated script or manually.

### Option 1: Consolidated Script

The project provides a consolidated script that automates starting the backend and frontend servers in the background, verifying they are up, executing all Playwright E2E tests, and tearing down the servers afterwards.

From the **repository root**:
```bash
bash run_e2e_tests.sh
```

Logs will be written to:
- `playwright.log`
- `backend.log`
- `frontend.log`

### Option 2: Manually Running Tests

If you prefer to run the servers yourself or see the interactive test output:

1.  Start the FastAPI backend server on port 8000.
2.  Start the Next.js frontend server on port 3000.
3.  Execute the Playwright tests from the **web/** directory:

    ```bash
    cd web
    npx playwright test
    ```

    To run tests in interactive UI mode:
    ```bash
    npx playwright test --ui
    ```
