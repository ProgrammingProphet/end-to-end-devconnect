# DevConnect Cloud Monitoring & Observability Stack

This directory contains the Kubernetes manifests and Helm configurations for the **Prometheus** & **Grafana** observability stack tailored for the DevConnect EKS cluster. This stack relies on the `kube-prometheus-stack` Helm chart which provides a complete out-of-the-box monitoring solution, including Node Exporters, Kube State Metrics, and sensible default dashboards.

## 1. Installation via Helm Commands

You will install the monitoring stack manually to the cluster via Helm from your WSL Ubuntu terminal.

### Add Helm Repositories
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add stable https://charts.helm.sh/stable
helm repo update
```

### Apply Namespace
```bash
kubectl apply -f namespace.yaml
```

### Install kube-prometheus-stack
We use the provided `prometheus-install.yaml` as our strict Values file for Helm to override the default behaviors (like setting retention data, default Grafana credentials, enabling exporters).

```bash
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  -f prometheus-install.yaml
```

### Apply Custom Exposing Configurations and Alerts
Apply the LoadBalancer service patch for Grafana, and our custom alert definitions.
```bash
kubectl apply -f grafana-service.yaml
kubectl apply -f custom-alerts.yaml
```

## 2. Accessing the Grafana UI

Since Grafana is exposed using a LoadBalancer, wait a few minutes for AWS to assign an external ELB host to your service. Check its address:
```bash
kubectl get svc devconnect-grafana -n monitoring
```

* Navigate to the provided `EXTERNAL-IP` address in your browser.
* **Username**: `admin`
* **Password**: `admin` (You should be prompted to change it upon first login).

The `kube-prometheus-stack` automatically wires Prometheus as the default Data Source for Grafana and pre-loads several very useful dashboards inside the "Dashboards -> General" tab, such as:
- **Kubernetes / Compute Resources / Namespace (Pods)**: CPU & Mem Usage per pod.
- **Kubernetes / Compute Resources / Node (Pods)**: CPU & Mem Usage per Node.
- **Node Exporter / USE Method / Node**: Intensive node metrics.

## 3. Example Metrics Queries (PromQL)

If you use the "Explore" tab in Grafana to directly query Prometheus, here are some highly useful PromQL lines for debugging your DevConnect ecosystem:

- **Avg CPU utilization across worker nodes:**
  ```promql
  100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
  ```
- **Top 5 Memory Intensive Pods:**
  ```promql
  topk(5, sum by (pod) (container_memory_usage_bytes{image!=""}))
  ```
- **Pod Restarts in the last 15 minutes:**
  ```promql
  sum by (pod) (changes(kube_pod_container_status_restarts_total[15m]))
  ```
- **Node Network Traffic (Receive):**
  ```promql
  rate(node_network_receive_bytes_total{device="eth0"}[5m])
  ```

## 4. Best Practices for Monitoring Kubernetes

- **Separate Namespace**: Always deploy your monitoring stack in a dedicated namespace (like `monitoring`) separate from application and GitOps tooling (ArgoCD).
- **Metric Retention**: Prometheus metrics can consume a vast amount of EBS storage very quickly in a dynamic K8s cluster. Ensure you explicitly set the `--storage.tsdb.retention.time` limit (We set ours to 15 days in the `prometheus-install.yaml`). For production history, use long-term storage mechanisms like Thanos or Grafana Mimir.
- **Resource Limits on Prometheus**: Ensure Prometheus Pods have defined `requests` and `limits` for CPU & RAM. The more metrics you expose, the greedier Prometheus gets.
- **Monitor the Monitors**: Make sure AlertManager is set up to notify your team via Slack/PagerDuty/Email when the cluster experiences issues. Our `custom-alerts.yaml` gives you a starting template.
- **Use Annotations for Custom Metrics**: If you want your custom DEVConnect apps to be scraped, annotate their pods/services properly: `<prometheus.io/scrape: "true">`. (Our stack is configured with `ServiceMonitors` which is the modern operator method).
