# DevConnect Centralized Log Management Setup

This directory contains the configurations necessary to deploy **Loki** and **Promtail** to your EKS cluster using Helm, and integrate them with your existing Grafana deployment.

## Architecture

**Loki** is a horizontally scalable, highly available, multi-tenant log aggregation system inspired by Prometheus. It is designed to be very cost-effective and easy to operate because it does not index the contents of the logs, but only a set of labels for each log stream.

**Promtail** is the agent which ships the contents of local logs to a private Loki cluster. It discovers targets acting just like Prometheus, attaches labels to log streams, and pushes them to the Loki instance.

```text
Kubernetes Pods -> Promtail (DaemonSet) -> Loki (Log Storage) -> Grafana (Visualization/Query)
```

## Installation Instructions

You will deploy Loki and Promtail in the existing `monitoring` namespace using their official Helm charts.

### 1. Add Helm Repositories

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
```

### 2. Install Loki
We use a lightweight, single-binary Loki setup defined in `loki/loki-values.yaml`.

```bash
helm install loki grafana/loki \
  --namespace monitoring \
  -f loki/loki-values.yaml
```

### 3. Install Promtail
Promtail runs as a DaemonSet to ensure every node in your EKS cluster has a log scraper running.

```bash
helm install promtail grafana/promtail \
  --namespace monitoring \
  -f promtail/promtail-values.yaml
```

### 4. Configure Grafana Datasource
Since you deployed the `kube-prometheus-stack` earlier, we can dynamically add the Loki datasource to Grafana simply by creating a ConfigMap with the correct label.

```bash
kubectl apply -f loki/grafana-datasource-loki.yaml
```

We label this ConfigMap with `grafana_datasource: "1"` which Grafana's sidecar container detects and automatically injects.

## Exploring Logs in Grafana

Access Grafana via the LoadBalancer IP provided earlier (or using Port Forwarding):
1. Navigate to Grafana UI in your browser.
2. Go to **Explore** (Compass icon on the left menu).
3. Select **Loki** from the dropdown menu at the top left.

### Example Log Queries (LogQL)

Loki uses LogQL, which is very similar to PromQL. Here are some queries you can use to debug DevConnect:

- **Filter by Namespace:** Show all logs in the `devconnect` namespace.
  ```logql
  {namespace="devconnect"}
  ```

- **Filter by Pod:** Follow log lines from a specific pod.
  ```logql
  {pod="devconnect-backend-12345-abcde"}
  ```

- **Filter by Container and Pattern:** Search for "error" strings across all pods running a specific application container.
  ```logql
  {container="devconnect-api"} |~ "(?i)error"
  ```

- **Parse JSON and filter:** Find logs where the JSON log has an `HTTP status` field value of 500.
  ```logql
  {app="frontend"} | json | status=500
  ```

## Dashboard Creation
To create beautiful Dashboards for visualizing logs over time:
1. Build your panel in Grafana with LogQL returning a metric. (e.g. `sum(rate({namespace="devconnect"}[5m])) by (pod)`)
2. Save the dashboard as JSON.
3. As part of your GitOps pipeline, wrap the JSON in a `ConfigMap` and place it in the `monitoring/dashboards` directory. Label it with `grafana_dashboard=1`.

## Best Practices for K8s Log Management

1. **Log Format:** Enforce JSON logging on your DevConnect node/go/java applications. It makes parsing logs incredibly simple natively within Loki.
2. **Rate Limiting:** Protect Loki from noisy applications by implementing per-tenant or global rate limits if your cluster multi-tenancy scales.
3. **Storage Tiering:** While local volume storage is fine for initial testing, enable **AWS S3** as the `object_store` within `loki-values.yaml` for production. It drastically reduces persistent storage costs and ensures high availability.
4. **Log Retention:** Be mindful of log retention. Configure the `compactor` component and table manager within the Loki configuration to automatically prune logs older than 15-30 days to save on S3 space.
