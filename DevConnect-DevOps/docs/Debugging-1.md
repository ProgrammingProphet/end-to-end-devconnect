# DevConnect Kubernetes Debugging Notes

This document records the issues encountered while deploying **DevConnect** on Kubernetes and the steps used to debug and fix them.
Use this as a quick troubleshooting reference for future deployments.

---

# 1. MongoDB Authentication Failed

## Error

```
MongoServerError: Authentication failed
```

## Cause

MongoDB root user was **not created**, even though the environment variables were defined.

```
MONGO_INITDB_ROOT_USERNAME
MONGO_INITDB_ROOT_PASSWORD
```

MongoDB only creates the root user **when `/data/db` is empty**.

Because a **PersistentVolumeClaim (PVC)** already contained data, initialization was skipped.

## Fix

Delete MongoDB deployment and PVC so MongoDB initializes again.

```
kubectl delete deployment mongodb-deployment -n devconnect
kubectl delete pvc mongodb-pvc -n devconnect
kubectl apply -f mongodb-deployment.yaml
```

Verify login:

```
kubectl exec -it -n devconnect <mongodb-pod> -- \
mongosh -u admin -p password123 --authenticationDatabase admin
```

---

# 2. MongoDB Container OOMKilled (Exit Code 137)

## Error

```
command terminated with exit code 137
```

## Cause

MongoDB container memory limits were too small.

```
limits:
  memory: 128Mi
```

MongoDB requires more memory even for development.

## Fix

Increase resource limits.

```
resources:
  requests:
    memory: 256Mi
    cpu: 250m
  limits:
    memory: 512Mi
    cpu: 500m
```

---

# 3. Backend Cannot Connect to MongoDB

## Error

```
Operation `users.findOne()` buffering timed out after 10000ms
```

Health endpoint:

```
"mongodb": "disconnected"
```

## Cause

Invalid MongoDB connection string in the Kubernetes secret.

Incorrect value:

```
mongodb://admin:password123@mongodb://mongodb-service:27017/devconnect
```

Notice the duplicated protocol:

```
mongodb://mongodb://
```

## Correct URI

```
mongodb://admin:password123@mongodb-service:27017/devconnect?authSource=admin
```

## Fix

Update the secret:

```
echo -n "mongodb://admin:password123@mongodb-service:27017/devconnect?authSource=admin" | base64
```

Apply the updated secret:

```
kubectl apply -f mongodb-secret.yaml
```

Restart backend:

```
kubectl rollout restart deployment backend-deployment -n devconnect
```

---

# 4. Deleting Pod but It Reappears

## Observation

Deleting a pod:

```
kubectl delete pod backend-devconnect-xxxx
```

The pod is recreated automatically.

## Cause

Pods are managed by a **ReplicaSet created by a Deployment**.
If the deployment specifies replicas = 1, Kubernetes recreates the pod.

## Fix

Delete the deployment instead:

```
kubectl delete deployment backend-devconnect -n devconnect
```

---

# 5. Ingress Returning 503

## Error

```
503 Service Temporarily Unavailable
```

## Cause

Ingress was created in a **different namespace** than the services.

Example:

```
Ingress namespace: devconnect-prod
Service namespace: devconnect
```

Ingress can only route to services in the **same namespace**.

## Fix

Ensure all components share the same namespace.

```
namespace: devconnect
```

---

# 6. Useful Debug Commands

## Check Pods

```
kubectl get pods -n devconnect
```

## Check Services

```
kubectl get svc -n devconnect
```

## Check Endpoints

```
kubectl get endpoints -n devconnect
```

## Check Environment Variables

```
kubectl exec -it <backend-pod> -n devconnect -- printenv
```

## Check Logs

```
kubectl logs <pod-name> -n devconnect
```

## Check Pod Details

```
kubectl describe pod <pod-name> -n devconnect
```

---

# 7. Deployment Architecture

```
Browser
   ↓
Ingress (devconnect.k8s.local)
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

# Key Lessons Learned

1. MongoDB initialization variables only run when the data directory is empty.
2. Always verify environment variables inside running pods.
3. Resource limits that are too small can kill containers.
4. Kubernetes recreates pods automatically if managed by deployments.
5. Ingress and services must be in the same namespace.
6. Incorrect connection strings are a common cause of database failures.

---

This document should help speed up debugging for future Kubernetes deployments.
