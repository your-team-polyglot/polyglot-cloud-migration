import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../src"))


def test_job_types_not_empty():
    from worker import JOB_TYPES
    assert len(JOB_TYPES) > 0


def test_job_types_are_strings():
    from worker import JOB_TYPES
    for job in JOB_TYPES:
        assert isinstance(job, str)


def test_process_job_returns_dict():
    from worker import process_job
    result = process_job("test_job")
    assert isinstance(result, dict)
    assert result["job"] == "test_job"
    assert result["status"] == "completed"


def test_process_job_duration_positive():
    from worker import process_job
    result = process_job("invoice_processing")
    assert result["duration_seconds"] > 0
