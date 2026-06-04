This directory is reserved for custom Grafana Dashboards implemented as ConfigMaps.

In a GitOps environment using the kube-prometheus-stack:
1. Export your custom dashboard from the Grafana UI (as JSON).
2. Wrap it inside a Kubernetes ConfigMap.
3. Label the ConfigMap `grafana_dashboard: "1"`.
4. The Grafana sidecar will automatically detect it and load it into Grafana.
