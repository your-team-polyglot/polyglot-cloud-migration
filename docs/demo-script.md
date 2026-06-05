# Final Demo Script

> Follow these steps exactly during the live demo to show the complete CI/CD loop.

---

## Step 1 – Show the Live App

1. Open browser → `http://<CLOUD_IP>:3000`
2. Note the current **theme colour** and **version number** shown in the header.
3. Open `http://<CLOUD_IP>:8080/api/status` — show the JSON response.

---

## Step 2 – Make a Visible Code Change

```bash
# On your local machine
git checkout -b fix/frontend-demo-change
```

Open `frontend-js/src/App.jsx` and change **one** of:
```js
const APP_VERSION = '1.0.0'   // → '2.0.0'
const THEME_COLOR = '#4f46e5' // → '#e11d48'  (red)
```

---

## Step 3 – Commit & Push

```bash
git add frontend-js/src/App.jsx
git commit -m "demo: change theme colour for live demo"
git push origin fix/frontend-demo-change
```

---

## Step 4 – Open a Pull Request

1. Go to GitHub → Pull requests → New pull request.
2. Base: `main` ← Compare: `fix/frontend-demo-change`
3. Title: `Demo: Update theme colour`
4. Click **Create pull request**.

---

## Step 5 – Show GitHub Actions Running

1. Click the **Checks** tab on the PR.
2. Show all three CI jobs running:
   - `.NET Tests & Lint`
   - `Python Tests & Lint`
   - `Frontend Tests & Lint`
3. Wait for all checks to pass (green ✓).

---

## Step 6 – Merge the Pull Request

1. Click **Merge pull request** → **Confirm merge**.
2. Observe the `build-and-push` job starts.
3. Observe the `trigger-jenkins` job runs after images are pushed.

---

## Step 7 – Show Jenkins Deploying

1. Open `http://your-jenkins:8081/job/polyglot-deploy`
2. Show the build triggered by GitHub Actions.
3. Walk through the stages:
   - Checkout → Verify Images → Copy Files → Pull Images → Deploy → Health Check
4. Show the final "DEPLOYMENT SUCCESSFUL" message.

---

## Step 8 – Refresh the Cloud URL

1. Return to `http://<CLOUD_IP>:3000`
2. Hard-refresh (`Ctrl+Shift+R` / `Cmd+Shift+R`)
3. Show the **new colour/version** live on the page.

---

## Step 9 – Terraform Destroy & Recreate

```bash
cd infra

# Destroy infrastructure
terraform destroy
# Confirm: yes

# Wait ~1 minute

# Recreate
terraform apply
# Confirm: yes
```

Show the new IP in the Terraform output.

Redeploy manually:
```bash
ssh -i your-key.pem ec2-user@<NEW_IP>
DOCKER_USERNAME=yourusername TAG=latest \
  docker compose -f /opt/polyglot/docker-compose.prod.yml up -d
```

Refresh browser at the new IP → app is live again.

---

## ✅ Demo Checklist

- [ ] Live cloud URL shown before the change
- [ ] Code change made in a feature branch
- [ ] Pull request opened
- [ ] GitHub Actions passes all checks
- [ ] PR merged to main
- [ ] Docker images built and pushed
- [ ] Jenkins triggered automatically
- [ ] Jenkins deploys to cloud VM
- [ ] Changed colour/text visible at live URL
- [ ] `terraform destroy` succeeds
- [ ] `terraform apply` recreates infrastructure
- [ ] App redeploys and works at new URL
