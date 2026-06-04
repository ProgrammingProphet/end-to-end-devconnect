# Argo CD GitOps Setup & Production Standards Handbook

This handbook provides the setup instructions, CLI guides, security standards, and advanced deployment configurations for implementing GitOps for the DevConnect application using Argo CD.

---

## 1. Directory Structure

The `argocd/` repository is organized into production-grade modules:
* **`apps/`**: Declarative Argo CD Applications for Dev, Staging, and Production.
* **`rbac/`**: AppProject specifications and ConfigMap configurations for User access control.
* **`secrets/`**: Declarative templates for GitOps-compliant secret managers (Sealed Secrets & External Secrets).
* **`rollouts/`**: Progressive delivery manifests (Canary & Blue-Green strategies) using Argo Rollouts.

---

## 2. Argo CD CLI Cheat Sheet

Ensure the Argo CD CLI is installed on your machine (`brew install argocd` on macOS, or chocolatey on Windows: `choco install argocd-cli`).

### Logging In
Login to the Argo CD API server via CLI (port-forward first to `localhost:8080`):
```bash
argocd login localhost:8080 --username admin --password <INITIAL_ADMIN_PASSWORD> --insecure
```

### Managing Applications
* **List Applications**:
  ```bash
  argocd app list
  ```
* **Sync (Deploy) manually**:
  ```bash
  argocd app sync devconnect-dev
  ```
* **Check Application Status**:
  ```bash
  argocd app get devconnect-prod
  ```
* **View deployment logs**:
  ```bash
  argocd app logs devconnect-dev --all
  ```
* **Roll back to a previous sync history**:
  ```bash
  argocd app rollback devconnect-prod <REVISION-ID>
  ```

---

## 3. Declarative Deployments (Multi-Environment)

Argo CD uses standard Custom Resources (`Application` and `AppProject`) to deploy the manifests declaratively:

1. **Apply the Projects boundary definition**:
   ```bash
   kubectl apply -f rbac/argocd-projects.yaml
   ```
2. **Apply the Application resources**:
   ```bash
   kubectl apply -f apps/devconnect-dev.yaml
   kubectl apply -f apps/devconnect-stage.yaml
   kubectl apply -f apps/devconnect-prod.yaml
   ```

---

## 4. Automated Image Updates (Argo CD Image Updater)

The manifests in `apps/` include annotations that instruct the **Argo CD Image Updater** to automatically track and update container image tags:
* **Regexp Filtering**: Dev and Staging applications look for tags matching `dev-*` and `stage-*` respectively, using the `latest` updated image matching that filter.
* **Semantic Versioning**: Production Application uses `semver` strategy (`v*` release tags) to ensure only valid, stable production builds are promoted.
* **Git Write-back Method**: The updater writes the tag update back to Git as a commit, ensuring your Git repo remains the absolute single source of truth.

---

## 5. Security & RBAC Configuration

Production environments restrict user access:
* **AppProject Boundary**: [argocd-projects.yaml](file:///c:/Users/MY-PC/Vikram-Workspace/DevOps/MEGA-PROJECTS/DevConnect-DevOps/argocd/rbac/argocd-projects.yaml) limits repositories, namespaces, and cluster-scoped resource deployments.
* **RBAC Policies**: [argocd-rbac-cm.yaml](file:///c:/Users/MY-PC/Vikram-Workspace/DevOps/MEGA-PROJECTS/DevConnect-DevOps/argocd/rbac/argocd-rbac-cm.yaml) implements the least privilege model, creating read-only, developer (sync only), and techlead roles.

Apply RBAC ConfigMap:
```bash
kubectl apply -f rbac/argocd-rbac-cm.yaml
```

---

## 6. GitOps Secret Management Standards

Never commit raw base64-encoded Kubernetes Secrets to Git. Use one of the two templates in the `secrets/` directory:

### Option A: Bitnami Sealed Secrets (In-Cluster Encryption)
1. Install the `kubeseal` CLI and controller.
2. Encrypt your plain secret locally:
   ```bash
   kubeseal --controller-name=sealed-secrets-controller < database/secrets.yml > argocd/secrets/mongodb-sealed-secret.yaml
   ```
3. Commit the resulting `SealedSecret` to Git. The controller inside Kubernetes will automatically decrypt it into a standard Secret.

### Option B: External Secrets Operator (HashiCorp Vault / AWS SM)
1. Installs the External Secrets Operator.
2. The `SecretStore` in [external-secret-template.yaml](file:///c:/Users/MY-PC/Vikram-Workspace/DevOps/MEGA-PROJECTS/DevConnect-DevOps/argocd/secrets/external-secret-template.yaml) maps connection details to a secret store (Vault/AWS/GCP).
3. The `ExternalSecret` retrieves credentials dynamically and creates/maintains native Kubernetes Secrets.

---

## 7. Advanced Deployment Strategies (Argo Rollouts)

Standard Kubernetes deployments only support RollingUpdates. For high availability, migrate standard deployment manifests to **Argo Rollouts**:

### Canary Strategy (Backend)
Configured in [backend-rollout.yaml](file:///c:/Users/MY-PC/Vikram-Workspace/DevOps/MEGA-PROJECTS/DevConnect-DevOps/argocd/rollouts/backend-rollout.yaml):
* Routes 10% traffic to the new version, pauses 5m.
* Promotes to 25%, pauses 10m for verification.
* Gradually routes 50%, then 100% traffic once verified.

### Blue-Green Strategy (Frontend)
Configured in [frontend-rollout.yaml](file:///c:/Users/MY-PC/Vikram-Workspace/DevOps/MEGA-PROJECTS/DevConnect-DevOps/argocd/rollouts/frontend-rollout.yaml):
* Deploys new frontend pods to a isolated *Preview* Service.
* Runs tests on the Preview environment.
* Instantly switches the live *Active* service to point to the new pods when promoted.

### Installation of Argo Rollouts:
```bash
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml
```

---

## 8. Important GitOps Standards

1. **Keep App Configs Separate**: Keep application code repositories separate from deployment infrastructure configurations (this repo) to prevent build triggers from conflicting with deployment sync loops.
2. **Pull-based Syncing**: Always prefer the pulling model where Argo CD pulls configuration updates from Git, rather than push scripts (`kubectl apply`) pushing modifications directly to Kubernetes.
3. **Always enable self-healing and pruning**: Set `prune: true` and `selfHeal: true` to prevent configuration drift (manual changes in the cluster will be automatically overridden by Argo CD back to the desired Git state).
