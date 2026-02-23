"""Render compatibility shim.

When Render runs with `rootDir=backend`, `uvicorn backend.app.main:app`
looks for a nested `backend` package. This shim re-exports the real app
from `app.main` so the same command works in both environments.
"""

from app.main import app

__all__ = ["app"]
