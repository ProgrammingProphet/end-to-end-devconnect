# Kubernetes Ingress – Learning, Setup & Debugging Guide

This document explains how to configure, test, and debug **NGINX Ingress Controller** for a Kubernetes application.
The guide is based on practical troubleshooting while deploying a **MERN stack application (DevConnect)** in a local Kubernetes cluster.

---

# Architecture Overview

The request flow in Kubernetes with Ingress works as follows:

```
Browser
   │
   ▼
Custom Domain (devconnect.k8s.local)
   │
   ▼
Ingress Controller (NGINX)
   │
   ├── /      → frontend-service
   │
   └── /api   → backend-service
                 │
                 ▼
               Pods
                 │
                 ▼
              MongoDB
```

Ingress acts as the **entry point to the Kubernetes cluster**.

---

# Installing NGINX Ingress Controller

Install the ingress controller using the official manifest.

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
```

Verify installation:

```bash
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx
```

Expected output:

```
ingress-nginx-controller    Running
ingress-nginx-controller-admission
```

---

# Creating an Ingress Resource

Example ingress configuration:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: devconnect-ingress
  namespace: devconnect-prod
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "false"

spec:
  ingressClassName: nginx

  rules:
  - host: devconnect.k8s.local
    http:
      paths:

      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 5000

      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

Apply ingress:

```bash
kubectl apply -f ingress.yaml
```

Verify:

```bash
kubectl get ingress -n devconnect-prod
```

---

# Local Domain Configuration

Add a local domain entry.

### Windows

Edit:

```
C:\Windows\System32\drivers\etc\hosts
```

Add:

```
127.0.0.1 devconnect.k8s.local
```

### Linux / WSL

Edit:

```
/etc/hosts
```

Add:

```
127.0.0.1 devconnect.k8s.local
```

---

# Exposing Ingress Locally

Since local clusters do not automatically provide a load balancer, we use **port-forward**.

```bash
kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 9090:80
```

Access the application:

```
http://devconnect.k8s.local:9090
```

---

# Testing Ingress Routing

Test ingress routing using curl.

```
curl -H "Host: devconnect.k8s.local" http://localhost:9090
```

Test API routing:

```
curl -H "Host: devconnect.k8s.local" http://localhost:9090/api
```

---

# Common Ingress Errors and Fixes

## 1. 404 Not Found (NGINX)

Cause:

Host header does not match ingress rule.

Example request:

```
http://localhost:9090
```

This sends:

```
Host: localhost
```

Fix:

Use the correct host.

```
http://devconnect.k8s.local:9090
```

or

```
curl -H "Host: devconnect.k8s.local" http://localhost:9090
```

---

## 2. Ingress Webhook Error

Error:

```
failed calling webhook validate.nginx.ingress.kubernetes.io
```

Fix:

```
kubectl delete ValidatingWebhookConfiguration ingress-nginx-admission
```

Then apply ingress again.

---

## 3. Connection Refused

Cause:

Ingress controller not reachable.

Check:

```
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx
```

---

## 4. Service Not Routing

Check service endpoints.

```
kubectl get endpoints -n devconnect-prod
```

Endpoints should show pod IP addresses.

---

# Debugging Checklist (Production Style)

When ingress fails, follow this order:

```
1️⃣ Check Pods
kubectl get pods

2️⃣ Check Services
kubectl get svc

3️⃣ Check Endpoints
kubectl get endpoints

4️⃣ Check Ingress
kubectl describe ingress

5️⃣ Check Ingress Controller Logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

This method helps identify whether the issue lies in:

* Pods
* Services
* Networking
* Ingress rules
* Controller configuration

---

# DevOps Best Practices

### Use separate domains for services

```
devconnect.k8s.local
api.k8s.local
grafana.k8s.local
argocd.k8s.local
```

### Avoid unnecessary rewrite rules

Remove this unless required:

```
nginx.ingress.kubernetes.io/rewrite-target
```

### Monitor ingress logs

```
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

---

# Learning Outcomes

Through this exercise I learned:

* How Kubernetes Ingress works
* Installing and configuring NGINX Ingress Controller
* Routing traffic to multiple services
* Using custom local domains
* Debugging ingress networking issues
* Troubleshooting admission webhook errors
* Production-style debugging workflow

---

# Conclusion

Ingress is the **primary entry point for external traffic into Kubernetes clusters**.
Understanding how to configure and debug it is essential for **DevOps and Cloud Engineers**.

This guide documents a real-world troubleshooting process while deploying a MERN stack application on Kubernetes.

