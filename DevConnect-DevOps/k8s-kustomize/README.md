# config.yaml

apiVersion: kind.x-k8s.io/v1alpha4
kind: Cluster

nodes:

- role: control-plane
    image: kindest/node:v1.29.4 #latest stable version of kindest/node
- role: worker
    image: kindest/node:v1.29.4
- role: worker
    image: kindest/node:v1.29.4

# command to create cluster: kind create cluster --name devconnect-cluster

# use config.yml file to create cluster: kind create cluster --config config.yml

# command to delete cluster: kind delete cluster --name devconnect-cluster

# what is kind?

# kind is a tool for running Kubernetes clusters locally

# it is a wrapper around Docker

# it is a tool for testing Kubernetes

# it is a tool for learning Kubernetes

# what is kindest/node:v1.29.4?

# it is a docker image that contains a Kubernetes cluster

# it is a tool for running Kubernetes clusters locally

# it is a wrapper around Docker

# it is a tool for testing Kubernetes

# it is a tool for learning Kubernetes

# set current context to cluster-devconnect
kubectl config use-context cluster-devconnect

Set Default Namespace

Run this once:

kubectl config set-context --current --namespace=devconnect

Then rebuild image:

docker build -t programmingprobhet/devconnect-frontend .
docker push programmingprobhet/devconnect-frontend

Then redeploy:

kubectl rollout restart deployment frontend-deployment

The easiest mental model (remember this)

Think of it like three layers of ports.

User ---> Service Port ---> Pod Port ---> Application
           (port)           (targetPort)    (containerPort)

Example:

User → 80 → 3000 → React App

Most common cause in Kubernetes

If your backend is running in Kubernetes, the usual problem is wrong MongoDB host.

❌ Example (wrong inside k8s)
MONGO_URI=mongodb://localhost:27017/devconnect

Inside Kubernetes:

localhost = the same container, not the MongoDB pod.

So your backend cannot reach MongoDB.

✅ Correct way

Use the MongoDB service name.

Example:

MONGO_URI=mongodb://mongodb-service:27017/devconnect

Where mongodb-service is your Kubernetes Service name.



kubectl port-forward svc/backend-service 5000:5000 --namespace devconnect
kubectl port-forward svc/frontend-service 80:80 --namespace devconnect

kubectl port-forward svc/ingress-nginx-controller 9090:80 --namespace ingress-nginx



kubectl get svc -n ingress-nginx


kubectl exec -it -n devconnect mongodb-deployment-65f79d5446-v4hn8 

mongosh 

-u admin -p password123

kubectl rollout restart deployment backend-deployment -n devconnect

kubectl exec -it -n devconnect mongodb-deployment-65f79d5446-v4hn8 -- mongosh -u admin -p password123

kubectl rollout status deployment backend-deployment -n devconnect

kubectl exec -it -n devconnect mongodb-deployment-65f79d5446-bcsnz -- mongosh -u admin -p password123 --authenticationDatabase admin