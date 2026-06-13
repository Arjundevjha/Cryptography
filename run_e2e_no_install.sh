#!/bin/bash

# Define directories
WORKSPACE_DIR="/Users/abc/Desktop/Cryptography"
WEB_DIR="$WORKSPACE_DIR/web"

echo "=== Starting E2E Setup and Test Script (No Install) ==="
date

cd "$WEB_DIR"

# 3. Start backend FastAPI server in background
echo "Starting FastAPI backend on port 8000..."
export PYTHONPATH="$WORKSPACE_DIR"
python3 -m uvicorn api.main:app --host 127.0.0.1 --port 8000 > "$WORKSPACE_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID $BACKEND_PID"

# 4. Start Next.js frontend in background
echo "Starting Next.js frontend on port 3000..."
npm run dev > "$WORKSPACE_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo "Frontend started with PID $FRONTEND_PID"

# 5. Function to clean up background processes on exit
cleanup() {
    echo "Cleaning up background processes..."
    if [ -n "$BACKEND_PID" ]; then
        echo "Stopping backend (PID $BACKEND_PID)..."
        kill -9 $BACKEND_PID || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        echo "Stopping frontend (PID $FRONTEND_PID)..."
        kill -9 $FRONTEND_PID || true
    fi
    # Also find and kill any stray uvicorn or next processes on those ports
    backend_stray=$(lsof -t -i:8000 || true)
    if [ -n "$backend_stray" ]; then
        echo "Killing stray backend on port 8000: $backend_stray"
        kill -9 $backend_stray || true
    fi
    frontend_stray=$(lsof -t -i:3000 || true)
    if [ -n "$frontend_stray" ]; then
        echo "Killing stray frontend on port 3000: $frontend_stray"
        kill -9 $frontend_stray || true
    fi
    echo "Cleanup complete."
}
trap cleanup EXIT

# 6. Wait for servers to start
echo "Waiting for backend on port 8000..."
backend_ok=0
for i in {1..30}; do
    if nc -z 127.0.0.1 8000 >/dev/null 2>&1; then
        echo "Backend is up!"
        backend_ok=1
        break
    fi
    sleep 1
done

echo "Waiting for frontend on port 3000..."
frontend_ok=0
for i in {1..30}; do
    if nc -z 127.0.0.1 3000 >/dev/null 2>&1; then
        echo "Frontend is up!"
        frontend_ok=1
        break
    fi
    sleep 1
done

# Check if both servers are up
if [ $backend_ok -ne 1 ]; then
    echo "ERROR: Backend failed to start. Logs:"
    cat "$WORKSPACE_DIR/backend.log"
    exit 1
fi

if [ $frontend_ok -ne 1 ]; then
    echo "ERROR: Frontend failed to start. Logs:"
    cat "$WORKSPACE_DIR/frontend.log"
    exit 1
fi

# 7. Run Playwright E2E tests
echo "Running Playwright E2E tests..."
npx playwright test > "$WORKSPACE_DIR/playwright.log" 2>&1
TEST_EXIT_CODE=$?
echo "Playwright tests finished with exit code $TEST_EXIT_CODE"

if [ $TEST_EXIT_CODE -ne 0 ]; then
    echo "ERROR: E2E tests failed. Logs:"
    cat "$WORKSPACE_DIR/playwright.log"
    exit $TEST_EXIT_CODE
else
    echo "SUCCESS: All E2E tests passed!"
fi
