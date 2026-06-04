#!/bin/bash
echo "Installing ArgoCD to the Kubernetes cluster..."

# Create the argocd namespace
kubectl create namespace argocd

# Apply the stable ArgoCD installation manifest
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

echo "Waiting for ArgoCD pods to be ready..."
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s

echo "Exposing the ArgoCD API server via NodePort..."
# Patching the service to NodePort for easier local/dev access
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort"}}'

echo "ArgoCD installation complete!"
echo "To get the initial admin password, run the following command:"
echo 'kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d'
