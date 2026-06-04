# Helm Mastery Guide: From Basics to Production (DevConnect)

This guide walks you through Helm, the package manager for Kubernetes, from local setup in WSL Ubuntu to production deployment logic with ArgoCD.

---

## 1. Helm Fundamentals

### What is Helm?
Helm is essentially a **Package Manager** for Kubernetes (think `apt` for Ubuntu or `npm` for Node.js). It allows you to define, install, and upgrade even the most complex Kubernetes applications.

### Why use Helm?
- **Reproducibility:** Deploy the same application across dev, staging, and production with consistent configurations.
- **Templating:** Instead of hardcoding YAML manifests, Helm uses a template engine (Go templates) to dynamically generate manifests based on `values.yaml`.
- **Version Control:** Helm tracks "Releases," allowing you to rollback to a previous version of your deployment with one command.

### Helm Architecture
Helm is a **client-only** binary (Helm 3+). It interacts directly with the Kubernetes API server using your local `kubeconfig` credentials.

---

## 2. Installation (WSL Ubuntu)

Run these commands in your WSL terminal to install the Helm binary:

```bash
curl https://baltocdn.com/helm/signing.asc | gpg --dearmor | sudo tee /usr/share/keyrings/helm.gpg > /dev/null
sudo apt-get install apt-transport-https --yes
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/helm.gpg] https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
sudo apt-get update
sudo apt-get install helm
```

Verify: `helm version`

---

## 3. Setup Local Kubernetes (Kind / Minikube)

We recommend **Kind** (Kubernetes in Docker) for WSL users due to its speed and simplicity.

### Install Kind
```bash
# For AMD64 / x86_64
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.22.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
```

### Create a Local Cluster
```bash
kind create cluster --name devconnect-local
```

---

## 4. Verify Connection

Check that your terminal is talking to the local cluster:
```bash
kubectl cluster-info --context kind-devconnect-local
kubectl get nodes
```

---

## 5. Basic Helm Commands

| Command | Description |
|---------|-------------|
| `helm repo add [name] [url]` | Add a chart repository (e.g., bitnami) |
| `helm search repo [keyword]` | Find charts in added repositories |
| `helm install [release] [chart]` | Deploy a chart to your cluster |
| `helm list` | List all deployed releases |
| `helm upgrade [release] [chart]`| Update an existing release |
| `helm rollback [release] [rev]` | Roll back to a previous revision |
| `helm uninstall [release]` | Delete a release and its resources |

---

## 6. Custom DevConnect Chart

We have created a sample chart in `helm-charts/devconnect`.

### Key Files in `devconnect-chart/`
- **`Chart.yaml`**: The metadata (version, name, description).
- **`values.yaml`**: The "configuration file." Change things here to change your deployment (e.g., replica count).
- **`templates/`**: The dynamic YAML skeletons.
  - `deployment.yaml`: Manages the application containers.
  - `service.yaml`: Provides a stable IP/DNS for the pods.
  - `_helpers.tpl`: Reusable logic snippets (labels, name generation).

---

## 7. Local Deployment & Upgrades

### Deploy the App
```bash
cd helm-charts
helm install devconnect ./devconnect
```

### Modify and Upgrade
1. Open `devconnect/values.yaml`.
2. Change `replicaCount: 2` to `replicaCount: 3`.
3. Upgrade:
   ```bash
   helm upgrade devconnect ./devconnect
   ```
4. Verify: `kubectl get pods`

---

## 8. Helm + ArgoCD Integration (GitOps)

In your production setup (AWS EKS), you won't run `helm install` manually. Instead, **ArgoCD** will do it for you.

### How it works:
1. You push your Helm Chart and its `values.yaml` to your GitHub repository.
2. An ArgoCD `Application` resource is created pointing to that directory.
3. ArgoCD periodically "renders" the Helm chart and applies the resulting YAML to EKS.
4. If you change a value in Git, ArgoCD detects the "Out of Sync" state and automatically performs a `helm upgrade` equivalent.

---

## 9. Best Practices for Production

- **Helm Lint:** Always run `helm lint ./chart-path` before committing.
- **Version Everything:** Increment the `version` in `Chart.yaml` for every change.
- **Dry Run:** Use `helm install --dry-run --debug` to see the generated YAML without applying it.
- **Secrets Management:** Do NOT store passwords in `values.yaml`. Use AWS Secrets Manager or Sealed Secrets.
- **Value Overrides:** Keep separate `values-dev.yaml` and `values-prod.yaml` for environment-specific configs.
