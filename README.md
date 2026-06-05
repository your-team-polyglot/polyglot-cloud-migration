# 🚀 Polyglot Cloud Migration

[![CI – Test, Lint & Build](https://github.com/YOUR_ORG/polyglot-cloud-migration/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_ORG/polyglot-cloud-migration/actions/workflows/ci.yml)

> ADCS-IV Semester Project · Department of Computer Science · Air University, Islamabad  
> Instructor: Asim Ali Fayyaz

A fully automated DevOps pipeline deploying a **three-tier polyglot application** — React frontend, ASP.NET Core backend, and Python worker — to AWS using Terraform, GitHub Actions CI, and Jenkins CD.

---

## 🏗 Architecture

```
Developer
   │  Push / Pull Request
   ▼
GitHub Repository
   │  GitHub Actions CI
   │  · test · lint · build images · push images
   ▼
Docker Hub (Docker Registry)
   │  CI success triggers Jenkins
   ▼
Jenkins Server
   │  SSH deployment
   ▼
AWS EC2 (provisioned by Terraform)
   │  docker compose pull && docker compose up -d
   ▼
Running Application
   Frontend (React) ──► .NET API ──► Python Worker ──► Redis
```

See [`docs/architecture.png`](docs/architecture.png) for a visual diagram.

---

## 👥 Team Members & Roles

| Name | Role |
|------|------|
| Member 1 | DevOps Lead – Terraform & CI/CD |
| Member 2 | Backend Developer – .NET API |
| Member 3 | Frontend Developer – React UI |
| Member 4 | Backend Developer – Python Worker |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Nginx |
| Backend API | ASP.NET Core 8 Web API |
| Background Worker | Python 3.12 |
| Message Queue | Redis 7 |
| Containerisation | Docker + Docker Compose |
| Orchestration | Docker Swarm |
| Infrastructure | Terraform (AWS) |
| CI | GitHub Actions |
| CD | Jenkins |
| Registry | Docker Hub |

---

## 🚦 Quick Start (Local)

### Prerequisites
- Docker Desktop ≥ 24  
- Docker Compose v2

```bash
git clone https://github.com/YOUR_ORG/polyglot-cloud-migration.git
cd polyglot-cloud-migration

# Build and start all services
docker compose up --build

# Access the app
open http://localhost:3000        # Frontend
curl http://localhost:8080/api/status  # Backend API
```

---

## 📦 Milestone Commands

### Milestone 1 – Containerisation

```bash
# Local development
docker compose up --build

# Docker Swarm
docker swarm init
docker stack deploy -c docker-stack.yml polyglot-app
docker service ls
docker stack ps polyglot-app

# Teardown
docker stack rm polyglot-app
docker swarm leave --force
```

### Milestone 2 – Terraform Infrastructure

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
# Fill in terraform.tfvars with your values

terraform init
terraform validate
terraform plan
terraform apply

# Destroy everything
terraform destroy
```

### Milestone 3 – GitHub Actions CI

Push to any `feature/**` or `fix/**` branch, or open a PR to `main`.  
The CI pipeline:
1. Runs .NET tests + dotnet format
2. Runs Python tests + flake8
3. Runs JS tests + eslint
4. Builds all Docker images
5. Pushes images to Docker Hub (on push to `main`)
6. Triggers Jenkins

### Milestone 4 – Jenkins CD

```
Jenkins → polyglot-deploy → Build with Parameters → IMAGE_TAG=<sha>
```

Jenkins will:
1. Pull latest images on the cloud VM
2. Run `docker compose up -d`
3. Health-check the app
4. Report the live URL

---

## 🔐 Secrets Used (Values Never Committed)

| Secret Name | Where Stored | Purpose |
|-------------|-------------|---------|
| `DOCKER_USERNAME` | GitHub Secret + Jenkins Credential | Docker Hub login |
| `DOCKER_PASSWORD` | GitHub Secret | Docker Hub push |
| `AWS_ACCESS_KEY_ID` | Terraform env / GitHub Secret | AWS provisioning |
| `AWS_SECRET_ACCESS_KEY` | Terraform env / GitHub Secret | AWS provisioning |
| `JENKINS_URL` | GitHub Secret | CI → CD trigger |
| `JENKINS_USER` | GitHub Secret | Jenkins auth |
| `JENKINS_API_TOKEN` | GitHub Secret | Jenkins auth |
| `cloud-vm-ip` | Jenkins Credential | SSH target |
| `cloud-vm-ssh-key` | Jenkins Credential | SSH access |

---

## 🌐 Deployment

After `terraform apply`, note the outputs:

```
frontend_url = "http://<IP>:3000"
api_url      = "http://<IP>:8080/api/status"
ssh_command  = "ssh -i your-key.pem ec2-user@<IP>"
```

The Jenkins pipeline deploys automatically after CI passes on `main`.

---

## 📁 Repository Structure

```
polyglot-cloud-migration/
├── backend-dotnet/          # ASP.NET Core 8 Web API
│   ├── Dockerfile
│   ├── src/PolyglotAPI/
│   └── tests/PolyglotAPI.Tests/
├── worker-python/           # Python background worker
│   ├── Dockerfile
│   ├── src/worker.py
│   ├── tests/
│   └── requirements.txt
├── frontend-js/             # React + Vite frontend
│   ├── Dockerfile
│   ├── src/
│   └── tests/
├── infra/                   # Terraform (AWS)
│   ├── main.tf
│   ├── provider.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── terraform.tfvars.example
├── deploy/                  # Production deployment files
│   ├── docker-compose.prod.yml
│   └── deploy.sh
├── .github/workflows/ci.yml # GitHub Actions CI
├── Jenkinsfile              # Jenkins CD pipeline
├── docker-compose.yml       # Local development
├── docker-stack.yml         # Docker Swarm
├── .gitignore
└── docs/
    ├── setup-guide.md
    ├── demo-script.md
    └── troubleshooting.md
```

---

## 📖 Documentation

- [Setup Guide](docs/setup-guide.md)
- [Demo Script](docs/demo-script.md)
- [Troubleshooting](docs/troubleshooting.md)

---

## ⚠️ Known Limitations

- The Python worker relies on Redis; without it, it retries and exits. Ensure Redis starts first.
- The EC2 instance user-data bootstrap takes ~2 minutes. Wait before SSH-ing.
- `terraform destroy` will remove the Elastic IP; update Jenkins credentials with the new IP after `terraform apply`.
- Jenkins must be accessible from the GitHub Actions runner (public URL required for the CI→CD trigger).

---

## 📸 Screenshots

Place screenshots in `docs/screenshots/`:
- Local Docker Compose running
- Docker Swarm service list
- Terraform apply output
- GitHub Actions passing
- Jenkins build success
- Live frontend URL
