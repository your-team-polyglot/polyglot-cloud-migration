# ── Build stage ──────────────────────────────────────────────────────────────
FROM python:3.12-slim AS builder
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM python:3.12-slim
WORKDIR /app

COPY --from=builder /install /usr/local
COPY src/ src/

ENV REDIS_URL=redis://redis:6379
ENV HEARTBEAT_INTERVAL=10
ENV PYTHONUNBUFFERED=1

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD python -c "import redis, os; r=redis.from_url(os.getenv('REDIS_URL','redis://redis:6379')); r.ping()" || exit 1

CMD ["python", "src/worker.py"]
