Write-Host "Installing ArgoCD to the Kubernetes cluster..."

# Create the argocd namespace
kubectl create namespace argocd

# Apply the stable ArgoCD installation manifest
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

Write-Host "Waiting for ArgoCD pods to be ready..."
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s

Write-Host "Exposing the ArgoCD API server via NodePort..."
# Patching the service to NodePort for easier local/dev access
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort"}}'

Write-Host "ArgoCD installation complete!"
Write-Host "To get the initial admin password, run the following command:"
Write-Host "kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath=`"{.data.password}`" | % { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }"
