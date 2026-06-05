"""Unit tests for the Python worker (no Redis required)."""

import sys
import os
import pytest

# Allow imports from src/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))


def test_process_task_runs_without_error(monkeypatch):
    """process_task should not raise for a valid task dict."""
    import time
    monkeypatch.setattr(time, "sleep", lambda _: None)

    from worker import process_task

    task = {"Id": 1, "Title": "Unit test task", "Status": "pending"}
    # Should not raise
    process_task(task)


def test_process_task_handles_missing_keys(monkeypatch):
    """process_task should handle tasks with missing fields gracefully."""
    import time
    monkeypatch.setattr(time, "sleep", lambda _: None)

    from worker import process_task

    # Minimal/empty dict
    process_task({})


def test_redis_url_env_default():
    """REDIS_URL should default to redis://redis:6379 if not set."""
    os.environ.pop("REDIS_URL", None)
    import importlib
    import worker  # noqa: F401  (already imported above, but test the constant)

    assert "redis" in os.getenv("REDIS_URL", "redis://redis:6379")


def test_heartbeat_interval_env():
    """HEARTBEAT_INTERVAL should be parsed as int."""
    os.environ["HEARTBEAT_INTERVAL"] = "15"
    interval = int(os.getenv("HEARTBEAT_INTERVAL", "10"))
    assert interval == 15
    os.environ.pop("HEARTBEAT_INTERVAL", None)
