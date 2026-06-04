# Kubernetes Debugging Cheat Sheet

Quick commands that solve ~80% of Kubernetes issues.

---

# 1. Check All Resources in a Namespace

First command to run when something breaks.

```
kubectl get all -n <namespace>
```

Example:

```
kubectl get all -n devconnect
```

Shows:

* Pods
* Services
* Deployments
* ReplicaSets

---

# 2. Check Pod Status

```
kubectl get pods -n <namespace>
```

Look for:

* Running ✅
* CrashLoopBackOff ❌
* ImagePullBackOff ❌
* Pending ❌

Example:

```
kubectl get pods -n devconnect
```

---

# 3. Inspect Pod Details

Shows events, environment variables, mounts, and errors.

```
kubectl describe pod <pod-name> -n <namespace>
```

Example:

```
kubectl describe pod backend-deployment-xxxxx -n devconnect
```

Very useful for:

* OOMKilled
* Image pull failures
* Volume issues

---

# 4. Check Container Logs

Most common debugging command.

```
kubectl logs <pod-name> -n <namespace>
```

Follow logs live:

```
kubectl logs -f <pod-name> -n <namespace>
```

Example:

```
kubectl logs backend-deployment-xxxxx -n devconnect
```

---

# 5. Execute Commands Inside a Pod

Used to inspect environment variables or test networking.

```
kubectl exec -it <pod-name> -n <namespace> -- sh
```

Example:

```
kubectl exec -it backend-pod -n devconnect -- sh
```

Useful commands inside pod:

```
printenv
ping mongodb-service
curl backend-service
```

---

# 6. Verify Environment Variables

Check if secrets/configs are loaded correctly.

```
kubectl exec -it <pod-name> -n <namespace> -- printenv
```

Example:

```
kubectl exec -it backend-pod -n devconnect -- printenv | grep MONGO
```

---

# 7. Check Services

Verify service ports and cluster IP.

```
kubectl get svc -n <namespace>
```

Example:

```
kubectl get svc -n devconnect
```

---

# 8. Check Service Endpoints

Shows which pods a service routes to.

```
kubectl get endpoints -n <namespace>
```

Example:

```
kubectl get endpoints -n devconnect
```

If it shows:

```
<none>
```

Then service selector does not match pod labels.

---

# 9. Restart a Deployment

Used when environment variables or secrets change.

```
kubectl rollout restart deployment <deployment-name> -n <namespace>
```

Example:

```
kubectl rollout restart deployment backend-deployment -n devconnect
```

---

# 10. Watch Logs While Deploying

Very useful during debugging.

```
kubectl logs -f deployment/<deployment-name> -n <namespace>
```

Example:

```
kubectl logs -f deployment/backend-deployment -n devconnect
```

---

# Bonus Useful Commands

## Check PVCs

```
kubectl get pvc -n <namespace>
```

## Check Ingress

```
kubectl get ingress -n <namespace>
```

## Check Nodes

```
kubectl get nodes
```

## Check Resource Usage

```
kubectl top pods -n <namespace>
```

---

# Golden Debugging Order (Follow This)

When something fails:

1. Check pods
2. Check logs
3. Describe pod
4. Check service
5. Check endpoints
6. Check environment variables
7. Test network inside pod

Commands:

```
kubectl get pods
kubectl logs
kubectl describe pod
kubectl get svc
kubectl get endpoints
kubectl exec
```

---

# DevConnect Deployment Architecture

```
User
 ↓
Ingress
 ↓
Frontend Service
 ↓
Backend Service
 ↓
Backend Pod
 ↓
MongoDB Service
 ↓
MongoDB Pod
```

---

# Key Lessons

* Always inspect logs first.
* Check environment variables inside pods.
* Services require matching labels.
* Pods recreated automatically by deployments.
* PVCs can prevent database initialization.
* Resource limits that are too low cause container crashes.

---

Keep this cheat sheet in the project to speed up future debugging.
