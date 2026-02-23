from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4


def build_meta(request_id: str | None = None) -> dict[str, str]:
    resolved_request_id = request_id or f"req_{uuid4().hex[:12]}"
    timestamp = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    return {
        "requestId": resolved_request_id,
        "timestamp": timestamp,
    }


def success_response(data: dict, request_id: str | None = None) -> dict:
    return {
        "success": True,
        "data": data,
        "meta": build_meta(request_id=request_id),
    }


def error_response(code: str, message: str, request_id: str | None = None) -> dict:
    return {
        "success": False,
        "error": {
            "code": code,
            "message": message,
        },
        "meta": build_meta(request_id=request_id),
    }
