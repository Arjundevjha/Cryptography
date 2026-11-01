#!/usr/bin/env bash
# ==============================================================================
# Cryptography Museum — End-to-End Test Runner
#
# Usage:
#   bash scripts/run_e2e.sh            # Run E2E against production build
#   bash scripts/run_e2e.sh --dev      # Run E2E against dev server
#   bash scripts/run_e2e.sh --install  # Install Python & Playwright deps first
# ==============================================================================

set -eo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="$REPO_ROOT/web"
LOG_DIR="$REPO_ROOT/test-results/logs"
mkdir -p "$LOG_DIR"

INSTALL_DEPS=false
DEV_MODE=false

for arg in "$@"; do
    case "$arg" in
        --install)
            INSTALL_DEPS=true
            ;;
        --dev)
            DEV_MODE=true
            ;;
        *)
            ;;
    esac
done

echo "========================================================"
echo " Starting Cryptography Museum E2E Test Suite"
echo " Workspace: $REPO_ROOT"
echo " Timestamp: $(date)"
echo "========================================================"

if [ "$INSTALL_DEPS" = true ]; then
    echo ">> Installing backend Python dependencies..."
    pip3 install -r "$WEB_DIR/requirements.txt" || python3 -m pip install -r "$WEB_DIR/requirements.txt"
    echo ">> Installing Playwright browser binaries..."
    (cd "$WEB_DIR" && npx playwright install --with-deps chromium)
fi

# Clean up any existing processes on ports 8000 and 3000
echo ">> Checking for existing processes on ports 8000 and 3000..."
backend_stray=$(lsof -t -i:8000 2>/dev/null || true)
if [ -n "$backend_stray" ]; then
    echo "Killing existing process on port 8000 (PID: $backend_stray)..."
    kill -9 $backend_stray 2>/dev/null || true
fi

frontend_stray=$(lsof -t -i:3000 2>/dev/null || true)
if [ -n "$frontend_stray" ]; then
    echo "Killing existing process on port 3000 (PID: $frontend_stray)..."
    kill -9 $frontend_stray 2>/dev/null || true
fi

# Start FastAPI backend
echo ">> Starting FastAPI backend server on http://127.0.0.1:8000..."
export PYTHONPATH="$REPO_ROOT"
python3 -m uvicorn web.api.main:app --host 127.0.0.1 --port 8000 > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo "Backend running with PID $BACKEND_PID"

# Prepare and start Next.js frontend
cd "$WEB_DIR"
if [ "$DEV_MODE" = true ]; then
    echo ">> Starting Next.js frontend in development mode on http://127.0.0.1:3000..."
    npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
else
    echo ">> Building Next.js production bundle..."
    npm run build
    echo ">> Starting Next.js frontend in production mode on http://127.0.0.1:3000..."
    npm run start > "$LOG_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
fi
echo "Frontend running with PID $FRONTEND_PID"

# Process cleanup handler
cleanup() {
    echo ""
    echo ">> Cleaning up test server processes..."
    if [ -n "$BACKEND_PID" ]; then
        kill -9 "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill -9 "$FRONTEND_PID" 2>/dev/null || true
    fi
    backend_stray=$(lsof -t -i:8000 2>/dev/null || true)
    if [ -n "$backend_stray" ]; then
        kill -9 $backend_stray 2>/dev/null || true
    fi
    frontend_stray=$(lsof -t -i:3000 2>/dev/null || true)
    if [ -n "$frontend_stray" ]; then
        kill -9 $frontend_stray 2>/dev/null || true
    fi
    echo ">> Cleanup finished."
}
trap cleanup EXIT INT TERM

# Wait for backend server
echo ">> Waiting for FastAPI backend to respond..."
backend_ready=false
for i in {1..30}; do
    if curl -s -f http://127.0.0.1:8000/api/health >/dev/null 2>&1; then
        echo "Backend is healthy! ($i s)"
        backend_ready=true
        break
    fi
    sleep 1
done

if [ "$backend_ready" = false ]; then
    echo "ERROR: Backend failed to start. Logs:"
    cat "$LOG_DIR/backend.log"
    exit 1
fi

# Wait for frontend server
echo ">> Waiting for Next.js frontend to respond..."
frontend_ready=false
for i in {1..30}; do
    if curl -s -f http://127.0.0.1:3000 >/dev/null 2>&1; then
        echo "Frontend is healthy! ($i s)"
        frontend_ready=true
        break
    fi
    sleep 1
done

if [ "$frontend_ready" = false ]; then
    echo "ERROR: Frontend failed to start. Logs:"
    cat "$LOG_DIR/frontend.log"
    exit 1
fi

# Run Playwright test suite
echo ">> Executing Playwright E2E tests..."
npx playwright test --config=playwright.config.ts
TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "========================================================"
    echo " SUCCESS: All Cryptography Museum E2E tests passed!"
    echo "========================================================"
else
    echo "========================================================"
    echo " ERROR: Playwright E2E tests failed with exit code $TEST_EXIT_CODE"
    echo "========================================================"
fi

exit $TEST_EXIT_CODE
