I’ll keep it practical—imagine you’re working on your **DevConnect project** locally in WSL with Kind/Minikube before moving to EKS.

---

# 1️⃣ Check Helm Version

First thing after installing Helm.

```bash
helm version
```

Shows the Helm client version and confirms installation.

---

# 2️⃣ Add a Helm Repository

Helm charts live in repositories.

Example: add Bitnami repo.

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
```

Example you will use later:

* Prometheus
* Grafana
* Loki
* Jaeger

---

# 3️⃣ Update Helm Repositories

```bash
helm repo update
```

Fetches the latest charts from all added repos.

Very common command.

---

# 4️⃣ Search for Charts

Search Helm repositories.

```bash
helm search repo prometheus
```

Example results might include:

* kube-prometheus-stack
* prometheus-node-exporter

---

# 5️⃣ Install a Helm Chart

Deploy an application to Kubernetes.

Example:

```bash
helm install my-nginx bitnami/nginx
```

For your project:

```bash
helm install prometheus prometheus-community/kube-prometheus-stack
```

---

# 6️⃣ List Installed Releases

See what Helm has deployed.

```bash
helm list
```

Example output:

```
NAME        NAMESPACE   STATUS
prometheus  monitoring  deployed
grafana     monitoring  deployed
```

---

# 7️⃣ Check Release Status

```bash
helm status prometheus
```

Shows:

* deployed resources
* notes
* service endpoints

---

# 8️⃣ Upgrade a Release

Used when updating configuration.

Example:

```bash
helm upgrade prometheus prometheus-community/kube-prometheus-stack
```

Or with custom values:

```bash
helm upgrade prometheus ./chart -f values.yaml
```

Very common in production.

---

# 9️⃣ Uninstall a Release

Remove an application.

```bash
helm uninstall prometheus
```

Deletes all Kubernetes resources created by the chart.

---

# 🔟 Create a Helm Chart

Create your own chart.

```bash
helm create devconnect
```

This generates:

```
devconnect/
  Chart.yaml
  values.yaml
  templates/
```

You will use this for your **DevConnect application**.

---

# 11️⃣ Package a Helm Chart

Convert chart into a distributable package.

```bash
helm package devconnect
```

Creates:

```
devconnect-0.1.0.tgz
```

Useful for chart repositories.

---

# 12️⃣ Show Chart Values

See configurable parameters.

```bash
helm show values bitnami/nginx
```

Example output:

```
replicaCount: 1
service:
  type: ClusterIP
```

Very useful before installation.

---

# 13️⃣ Install with Custom Values

```bash
helm install devconnect ./devconnect -f values.yaml
```

Example changes:

* replicas
* image
* service type

---

# 14️⃣ Get Release Values

See the configuration used for deployment.

```bash
helm get values devconnect
```

Helps debug production issues.

---

# 15️⃣ Dry Run Installation

One of the **most important commands**.

```bash
helm install devconnect ./devconnect --dry-run --debug
```

This:

* validates templates
* shows generated YAML
* prevents breaking production

DevOps engineers use this **a lot**.

---

# ⭐ Real Commands You’ll Use in DevConnect

Example workflow:

### Add repos

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

---

### Install Prometheus

```bash
helm install prometheus prometheus-community/kube-prometheus-stack \
-n monitoring --create-namespace
```

---

### Install Grafana

```bash
helm install grafana grafana/grafana -n monitoring
```

---

### Install Loki

```bash
helm install loki grafana/loki-stack -n monitoring
```

---

### Install Jaeger

```bash
helm install jaeger jaegertracing/jaeger -n monitoring
```

---

# 🧠 One Interview Trick

If interviewer asks **“Why Helm instead of raw YAML?”**

You can say:

> Helm simplifies Kubernetes deployments by templating manifests, managing application versions, and enabling reusable configurations using values.yaml.

Short, clean, and professional.
