#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh – Manual deployment helper (also used by Jenkinsfile)
# Usage: DOCKER_USERNAME=user TAG=latest ./deploy.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DOCKER_USERNAME="${DOCKER_USERNAME:?DOCKER_USERNAME not set}"
TAG="${TAG:-latest}"
COMPOSE_FILE="$(dirname "$0")/docker-compose.prod.yml"
APP_URL="http://localhost:3000"
MAX_WAIT=60

echo "════════════════════════════════════════"
echo " Polyglot Cloud Migration – Deploy"
echo " Images : ${DOCKER_USERNAME}/polyglot-*:${TAG}"
echo " Compose: ${COMPOSE_FILE}"
echo "════════════════════════════════════════"

# Pull latest images
echo "[1/4] Pulling images…"
DOCKER_USERNAME="${DOCKER_USERNAME}" TAG="${TAG}" docker compose -f "${COMPOSE_FILE}" pull

# Bring up containers (rolling restart)
echo "[2/4] Starting containers…"
DOCKER_USERNAME="${DOCKER_USERNAME}" TAG="${TAG}" docker compose -f "${COMPOSE_FILE}" up -d --remove-orphans

# Wait for health check
echo "[3/4] Waiting for app to be healthy (max ${MAX_WAIT}s)…"
elapsed=0
until curl -sf "${APP_URL}" > /dev/null 2>&1; do
    if (( elapsed >= MAX_WAIT )); then
        echo "ERROR: App did not become healthy within ${MAX_WAIT}s"
        docker compose -f "${COMPOSE_FILE}" logs --tail=30
        exit 1
    fi
    echo "  …waiting (${elapsed}s)"
    sleep 5
    elapsed=$(( elapsed + 5 ))
done

echo "[4/4] App is LIVE at ${APP_URL}"
echo ""
echo "Running containers:"
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
