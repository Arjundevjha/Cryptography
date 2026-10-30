#!/usr/bin/env python3
"""
Diagnostic CLI for Cryptography repository health, tests, and branch hygiene.
Usage:
    python3 scripts/diagnose.py --check
    python3 scripts/diagnose.py --verbose
"""

import argparse
import subprocess
import sys
from pathlib import Path


def run_cmd(cmd: list[str], cwd: Path) -> tuple[int, str]:
    res = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    return res.returncode, res.stdout + res.stderr


def main():
    parser = argparse.ArgumentParser(description="Diagnostic CLI for Cryptography repository.")
    parser.add_argument("--check", action="store_true", help="Run comprehensive health checks")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parent.parent

    print("=== Cryptography Diagnostic Health Check ===")

    # 1. Check Python test suite
    print("Checking Python test suite (pytest)...", end=" ", flush=True)
    code, out = run_cmd(["pytest", "-q"], repo_root)
    if code == 0:
        print("PASSED")
    else:
        print("FAILED")
        if args.verbose:
            print(out)
        sys.exit(1)

    # 2. Check Web test suite
    print("Checking Web test suite (npm test)...", end=" ", flush=True)
    code, out = run_cmd(["npm", "test", "--prefix", "web", "--", "--silent"], repo_root)
    if code == 0:
        print("PASSED")
    else:
        print("FAILED")
        if args.verbose:
            print(out)
        sys.exit(1)

    # 3. Check Web production build
    print("Checking Web production build (npm run build)...", end=" ", flush=True)
    code, out = run_cmd(["npm", "run", "build", "--prefix", "web"], repo_root)
    if code == 0:
        print("PASSED")
    else:
        print("FAILED")
        if args.verbose:
            print(out)
        sys.exit(1)

    # 4. Check git status
    print("Checking git working directory cleanliness...", end=" ", flush=True)
    code, out = run_cmd(["git", "status", "--porcelain"], repo_root)
    if out.strip():
        print("DIRTY (uncommitted changes present)")
    else:
        print("CLEAN")

    print("\nAll core health diagnostic checks passed successfully.")


if __name__ == "__main__":
    main()
