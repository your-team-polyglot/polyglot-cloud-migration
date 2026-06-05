# Troubleshooting Guide

## Docker Issues

### Services fail to start
```bash
docker compose logs backend
docker compose logs worker
docker compose logs frontend
```

### Port already in use
```bash
# Find what is using port 8080
lsof -i :8080   # macOS/Linux
netstat -ano | findstr :8080  # Windows

# Stop all containers
docker compose down
```

### Redis connection refused
- Ensure Redis is healthy before other services start.
- Check: `docker compose ps` — Redis should show `healthy`.
- Fix: `docker compose restart redis && docker compose restart worker`

---

## Terraform Issues

### `Error: No valid credential sources found`
```bash
# Set credentials
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
# Or
aws configure
```

### `Error: InvalidKeyPair.NotFound`
- Create the key pair in AWS Console under EC2 → Key Pairs.
- Make sure `key_name` in `terraform.tfvars` matches exactly.

### Instance not reachable via SSH
1. Check `my_ip_cidr` in `terraform.tfvars` — must be `YOUR_PUBLIC_IP/32`.
2. Get your current IP: `curl ifconfig.me`
3. Update and re-run `terraform apply`.

### User-data hasn't finished
- Wait ~3 minutes after `terraform apply` before SSH-ing.
- Check: `cat /tmp/bootstrap.done` on the instance.

---

## GitHub Actions Issues

### CI fails on `dotnet format`
```bash
cd backend-dotnet
dotnet format PolyglotAPI.sln
git add -A && git commit -m "fix: format"
```

### Docker push fails
- Verify `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets are set in GitHub.
- Test locally: `docker login`

### Jenkins trigger fails
- Verify `JENKINS_URL` is publicly accessible (not `localhost`).
- Check `JENKINS_USER` and `JENKINS_API_TOKEN` secrets.

---

## Jenkins Issues

### Cannot SSH to cloud VM
- Verify `cloud-vm-ip` credential value is the current Elastic IP.
- Verify `cloud-vm-ssh-key` contains the full private key content.
- Test: `ssh -i key.pem ec2-user@<IP>`

### Health check fails
```bash
# On the cloud VM
docker ps
docker compose -f /opt/polyglot/docker-compose.prod.yml logs --tail=20
```

### Images not pulling
- Docker Hub rate limits: log in → `docker login` on the VM.
- Check image name: `DOCKER_USERNAME/polyglot-backend:TAG`

---

## Frontend Issues

### "Cannot reach backend API" message
- Ensure the backend container is running: `docker ps`
- Check Nginx proxy config in `frontend-js/nginx.conf`
- The `location /api/` block proxies to `http://backend:8080`

### App shows old version after deploy
- Hard-refresh: `Ctrl+Shift+R` (Win/Linux) or `Cmd+Shift+R` (Mac)
- Clear browser cache

---

## Python Worker Issues

### Worker keeps restarting
```bash
docker logs polyglot-worker
# Usually Redis not ready yet — wait and retry
```

### ImportError: No module named 'redis'
```bash
cd worker-python
pip install -r requirements.txt
```
