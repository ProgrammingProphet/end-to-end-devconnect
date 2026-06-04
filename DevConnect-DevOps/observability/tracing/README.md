# DevConnect Distributed Tracing Setup

This directory contains the Helm configurations and Kubernetes manifests for deploying **Jaeger** to the DevConnect EKS cluster. Jaeger provides powerful distributed tracing capabilities to help you understand latency, dependencies, and root causes of errors across your microservices.

## 1. Installation via Helm

We will use the official Jaeger Helm chart to deploy Jaeger in **All-in-One** mode. This mode is excellent for development and small-scale deployments as it bundles the agent, collector, query service, and UI into a single pod using memory storage.

### Add Helm Repository

```bash
helm repo add jaegertracing https://jaegertracing.github.io/helm-charts
helm repo update
```

### Install Jaeger

Run this from the `observability/tracing/jaeger/` directory:

```bash
helm install jaeger jaegertracing/jaeger \
  --namespace monitoring \
  -f jaeger-values.yaml
```

### Expose the Jaeger UI

By default, the chart exposes the UI (Query service) via an internal ClusterIP. We will apply our custom Service manifest to expose it externally via an AWS LoadBalancer so you can access it easily.

```bash
kubectl apply -f jaeger-service.yaml
```

## 2. Accessing the Jaeger UI

Wait a few minutes for the AWS LoadBalancer to provision, then retrieve its public IP/hostname:

```bash
kubectl get svc jaeger-query-lb -n monitoring
```

Open a browser and navigate to the `EXTERNAL-IP` on port `80`. The beautiful Jaeger search interface will be available immediately!

## 3. Instrumenting Your DevConnect Applications

For Jaeger to display traces, your applications (like your frontend, backend, and APIs) must be instrumented to send OpenTelemetry (OTel) traces.

### The Node.js Example

We have provided a plug-and-play example in `example-nodejs-app.js`. This shows how to utilize OpenTelemetry auto-instrumentation for an Express API.

**How it works:**
1. The OpenTelemetry SDK intercepts incoming HTTP requests, creating a `Span`.
2. As the request moves through your code (e.g., querying a database, making outgoing external upstream API calls), the auto-instrumentation creates child `Spans`.
3. When the request finishes, the entire tree of Spans (a complete `Trace`) is exported via the `OTLPTraceExporter` directly to the `jaeger-collector.monitoring.svc.cluster.local:4318` endpoint in our cluster.

### Trace Visualization in Jaeger

When you open the Jaeger UI and select `devconnect-api-service` from the *Service* dropdown:
- You will see a timeline of requests (Traces).
- Clicking a trace expands it to show every individual `Span`.
- You will be able to see exactly how many milliseconds the `HTTP GET /api/users` endpoint took, and sub-spans detailing exactly how long the simulated DB call or downstream service took.
- Error statuses are highlighted in red instantly.

## 4. Best Practices for Distributed Tracing

1. **Auto-Instrumentation First:** Always start by using OpenTelemetry's auto-instrumentation libraries (available for Node.js, Java, Python, Go, etc.). They require very few lines of code and instantly capture 90% of the vital data (HTTP, gRPC, Redis, SQL calls).
2. **Context Propagation:** Ensure your ingress controllers (like NGINX) or API Gateways are configured to generate and pass `traceparent` headers to your backend services. This is how traces tie together across microservice boundaries!
3. **Transitioning to Production:** The `all-in-one` mode uses in-memory storage (spans are lost on pod restart) and is strictly for dev/test. When moving to production:
   - Modify the `jaeger-values.yaml` to deploy Jaeger in **Production mode**.
   - This scales out the collector and query components separately and uses **Cassandra** or **Elasticsearch/OpenSearch** as the persistent backing store.
4. **Sampling Rates:** By default, Jaeger might try to sample 100% of traces. In a high-traffic production EKS cluster, configure probabilistic sampling (e.g., `0.1` for 10%) on the Jaeger Collector to save on massive storage and network overhead.
