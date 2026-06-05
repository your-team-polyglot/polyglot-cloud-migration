"""
Polyglot Cloud Migration – Python Worker Service
Consumes tasks from Redis queue and processes them as background jobs.
"""

import json
import os
import time
import logging
import schedule
import threading

import redis

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [WORKER] %(levelname)s – %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%SZ",
)
logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")
QUEUE_KEY = "task_queue"
HEARTBEAT_INTERVAL = int(os.getenv("HEARTBEAT_INTERVAL", "10"))


def get_redis_client():
    """Return a Redis client; retry on connection failure."""
    for attempt in range(10):
        try:
            client = redis.from_url(REDIS_URL, decode_responses=True)
            client.ping()
            logger.info("Connected to Redis at %s", REDIS_URL)
            return client
        except redis.exceptions.ConnectionError:
            logger.warning(
                "Redis not ready (attempt %d/10). Retrying in 3 s…", attempt + 1
            )
            time.sleep(3)
    logger.error("Could not connect to Redis after 10 attempts. Exiting.")
    raise SystemExit(1)


def process_task(task: dict) -> None:
    """Simulate processing a task."""
    task_id = task.get("Id", "?")
    title = task.get("Title", "unknown")
    logger.info("Processing task #%s: '%s'", task_id, title)

    # Simulate work
    time.sleep(1)

    logger.info("Completed task #%s", task_id)


def consume_queue(r: redis.Redis) -> None:
    """Blocking pop from the Redis task queue."""
    logger.info("Listening on queue '%s'…", QUEUE_KEY)
    while True:
        try:
            # BLPOP blocks for 5 s then loops (allows clean shutdown)
            result = r.blpop(QUEUE_KEY, timeout=5)
            if result:
                _, raw = result
                try:
                    task = json.loads(raw)
                    process_task(task)
                except json.JSONDecodeError:
                    logger.error("Could not parse task payload: %s", raw)
        except redis.exceptions.ConnectionError:
            logger.warning("Lost Redis connection. Reconnecting in 5 s…")
            time.sleep(5)
            r = get_redis_client()


def heartbeat(r: redis.Redis) -> None:
    """Publish a periodic heartbeat to Redis."""
    r.set("worker:heartbeat", int(time.time()))
    logger.info("Heartbeat sent.")


def run_scheduler(r: redis.Redis) -> None:
    """Run the heartbeat scheduler in a background thread."""
    schedule.every(HEARTBEAT_INTERVAL).seconds.do(heartbeat, r)
    while True:
        schedule.run_pending()
        time.sleep(1)


def main() -> None:
    logger.info("Starting Python Worker Service…")
    r = get_redis_client()

    # Run scheduler in a daemon thread
    scheduler_thread = threading.Thread(
        target=run_scheduler, args=(r,), daemon=True
    )
    scheduler_thread.start()

    # Main loop: consume tasks
    consume_queue(r)


if __name__ == "__main__":
    main()
