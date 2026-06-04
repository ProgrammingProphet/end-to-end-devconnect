#!/bin/bash

echo "Installing Metrics Server..."
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

echo "Waiting for metrics-server deployment to be created..."
sleep 10

echo "Patching metrics-server for local cluster TLS issue..."
kubectl patch deployment metrics-server -n kube-system \
  --type='json' \
  -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'

echo "Restarting metrics-server..."
kubectl rollout restart deployment metrics-server -n kube-system

echo "Waiting for metrics-server to become ready..."
kubectl wait --for=condition=available deployment/metrics-server -n kube-system --timeout=120s

echo "Checking metrics-server pod..."
kubectl get pods -n kube-system | grep metrics-server

echo "Checking node metrics..."
kubectl top nodes

echo "Checking pod metrics in devconnect namespace..."
kubectl top pods -n devconnect

echo "Metrics Server installation complete ✅"

# kubectl delete -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml