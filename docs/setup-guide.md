# Setup Guide

## 1. Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Docker | ≥ 24 | https://docs.docker.com/get-docker/ |
| Docker Compose | v2 | Included with Docker Desktop |
| Terraform | ≥ 1.6 | https://developer.hashicorp.com/terraform/install |
| AWS CLI | ≥ 2 | https://aws.amazon.com/cli/ |
| Node.js | 20 LTS | https://nodejs.org |
| .NET SDK | 8.0 | https://dotnet.microsoft.com/download |
| Python | 3.12 | https://python.org |
| Jenkins | LTS | https://www.jenkins.io/download/ |

---

## 2. Clone & Configure

```bash
git clone https://github.com/YOUR_ORG/polyglot-cloud-migration.git
cd polyglot-cloud-migration
```

---

## 3. Local Development (Docker Compose)

```bash
docker compose up --build
```

Services available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api/status
- **Redis**: localhost:6379

Stop: `docker compose down`

---

## 4. Docker Swarm (Local Orchestration)

```bash
# Initialise Swarm (once per machine)
docker swarm init

# Deploy the stack
docker stack deploy -c docker-stack.yml polyglot-app

# Check services
docker service ls
docker stack ps polyglot-app

# Scale a service
docker service scale polyglot-app_backend=3

# Remove the stack
docker stack rm polyglot-app
```

---

## 5. Terraform (AWS)

### 5a. AWS credentials
```bash
export AWS_ACCESS_KEY_ID="your-key-id"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
# Or use AWS CLI: aws configure
```

### 5b. Create key pair
1. AWS Console → EC2 → Key Pairs → Create
2. Download the `.pem` file
3. `chmod 400 your-key.pem`

### 5c. Run Terraform
```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

terraform init
terraform validate
terraform plan
terraform apply

# Note the outputs:
#   public_ip  = "x.x.x.x"
#   frontend_url = "http://x.x.x.x:3000"
```

### 5d. Destroy & recreate
```bash
terraform destroy
terraform apply
```

---

## 6. GitHub Secrets Required

In your GitHub Organisation repo → Settings → Secrets and variables → Actions:

| Secret | Value |
|--------|-------|
| `DOCKER_USERNAME` | Your Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password or access token |
| `JENKINS_URL` | http://your-jenkins-server:8081 |
| `JENKINS_USER` | Jenkins username |
| `JENKINS_API_TOKEN` | Jenkins API token |

---

## 7. Jenkins Setup

1. Install Jenkins (LTS) on a server or the cloud VM.
2. Install plugins: **Pipeline**, **SSH Agent**, **Git**, **Docker Pipeline**.
3. Add credentials:
   - `docker-username` (Secret text) — Docker Hub username
   - `cloud-vm-ip` (Secret text) — EC2 public IP
   - `cloud-vm-ssh-key` (SSH Username with private key) — ec2-user + .pem contents
4. Create a new **Pipeline** job named `polyglot-deploy`.
5. Set Pipeline source: SCM → Git → your repo → Jenkinsfile.
6. Save and trigger a build.

---

## 8. Branch Protection (GitHub)

In the repo → Settings → Branches → Add rule for `main`:
- ✅ Require a pull request before merging
- ✅ Require approvals: 1
- ✅ Require status checks to pass
  - Add: `test-dotnet`, `test-python`, `test-frontend`
- ✅ Do not allow bypassing the above settings
