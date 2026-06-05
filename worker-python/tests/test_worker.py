import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../src"))

def test_worker_module_imports():
    import worker
    assert worker is not None


def test_process_task_runs():
    from worker import process_task
    task = {"Id": "1", "Title": "Test task"}
    try:
        process_task(task)
        assert True
    except Exception as e:
        assert False, f"process_task raised: {e}"


def test_redis_url_default():
    import os
    os.environ.setdefault("REDIS_URL", "redis://redis:6379")
    assert os.getenv("REDIS_URL") is not None


def test_queue_key_defined():
    from worker import QUEUE_KEY
    assert QUEUE_KEY == "task_queue"
