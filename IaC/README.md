# ShopSphere: Multi-Environment IaC & Configuration Management

This repository contains a production-grade, modular Infrastructure as Code (IaC) and configuration management project using **Terraform** and **Ansible**. It provisions and configures three isolated environments on AWS: **Development**, **Staging**, and **Production**, demonstrating enterprise patterns like remote state locking, private subnet node isolation, and GitOps bootstrapping.

---

## Repository Structure

```text
ShopSphere-Terraform/
├── terraform/                  # Infrastructure as Code
│   ├── modules/                # Reusable Infrastructure Modules
│   │   ├── vpc/                # Base VPC and Internet Gateway
│   │   ├── networking/         # Subnets, NAT Gateways, Route Tables, EIPs
│   │   ├── security-group/     # Environment-specific SGs (Dev, Stage, Prod)
│   │   ├── iam/                # Least-privilege IAM Roles and Policies
│   │   ├── ec2/                # Compute instances (Dev, Staging Master/Workers)
│   │   └── eks/                # Production EKS Cluster and Node Groups
│   ├── environments/           # Environment Parameter Files
│   │   ├── dev.tfvars          # Dev input parameters
│   │   ├── stage.tfvars        # Stage input parameters
│   │   ├── prod.tfvars         # Prod input parameters
│   │   ├── dev-backend.tfvars  # Dev backend config
│   │   ├── stage-backend.tfvars# Stage backend config
│   │   └── prod-backend.tfvars # Prod backend config
│   ├── main.tf                 # Root Terraform orchestration
│   ├── variables.tf            # Root variables definitions
│   ├── outputs.tf              # Root outputs declarations
│   ├── providers.tf            # AWS & Local providers setup
│   └── backend.tf              # Partial S3 backend declaration
│
├── ansible/                    # Configuration Management
│   ├── playbooks/              # Orchestration Playbooks
│   │   ├── dev-setup.yml       # Dev kind setup
│   │   ├── stage-setup.yml     # Staging kubeadm cluster setup
│   │   └── prod-setup.yml      # Production EKS post-bootstrap
│   ├── roles/                  # Reusable Automation Roles
│   │   ├── common/             # Updates cache and installs base packages
│   │   ├── docker/             # Docker engine & containerd setup (with SystemdCgroup)
│   │   ├── kind/               # Installs kubectl, kind, and creates cluster
│   │   ├── kubeadm/            # Disables swap, sets sysctl, installs kubelets/kubeadm
│   │   ├── helm/               # Installs Helm package manager
│   │   ├── kustomize/          # Installs Kustomize CLI
│   │   ├── argocd/             # Deploys ArgoCD core resources to clusters
│   │   └── monitoring/         # Deploys Cert-Manager, Metrics-Server, Prometheus & Grafana
│   ├── inventories/            # Auto-generated hosts.ini configurations
│   └── ansible.cfg             # Default connection settings
│
└── README.md                   # Project Documentation
```

---

## Multi-Environment Architecture

### 1. Development (dev)
* **Purpose**: Personal Kubernetes learning, Helm/Kustomize/GitOps practice.
* **Infrastructure**:
  * 1 Ubuntu 24.04 EC2 instance inside a public subnet.
  * Security group allowing Ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 8080/8443 (ArgoCD), and 6443 (Kind API).
* **Automation**:
  * Installs Docker, Docker Compose, kubectl, Kind, Helm, ArgoCD CLI, Kustomize, jq, vim, git.
  * Provisions a **Kind** cluster with host port mappings (80/443 mapping to Kind ingress).
  * Deploys **ArgoCD** into the Kind cluster, exposed via NodePort.

### 2. Staging (stage)
* **Purpose**: Realistic pre-production environment simulating multi-node K8s and network segregation.
* **Infrastructure**:
  * 1 Master Ubuntu Node (Public Subnet for SSH/API Access).
  * 2 Worker Ubuntu Nodes (Private Subnets for workload safety).
  * 1 NAT Gateway allowing workers egress access.
  * Network routing configured so workers can *only* be SSH'ed into using the Master node as a bastion host.
* **Automation**:
  * Disables swap, configures kernel parameters (`br_netfilter`, `overlay`, `sysctl`).
  * Configures containerd container runtime with `SystemdCgroup` enabled.
  * Bootstraps a **kubeadm** Kubernetes cluster, automatically generating a join token and joining workers.
  * Deploys **Ingress NGINX**, **Metrics Server** (configured with `--kubelet-insecure-tls`), **Cert Manager**, and **kube-prometheus-stack** (Prometheus & Grafana).

### 3. Production (prod)
* **Purpose**: Enterprise-ready, managed EKS environment.
* **Infrastructure**:
  * Managed Amazon EKS Cluster.
  * Managed Node Group (2-5 nodes, `t3.medium`) spanning multiple availability zones.
  * EKS cluster OIDC provider enabled.
  * Least-privilege IAM Roles for EKS control plane and worker nodes.
  * Dedicated IAM Roles for Service Accounts (IRSA) for AWS Load Balancer Controller and Cluster Autoscaler.
* **Automation**:
  * Connects locally to EKS using AWS CLI credentials and updates kubeconfig.
  * Deploys EKS-ready workloads: **ArgoCD**, **Metrics Server**, **Cert Manager**, and **kube-prometheus-stack** (Prometheus & Grafana) with LoadBalancer access.

---

## Tagging & Resource Naming Strategy

### Dynamic Naming
All resources dynamically append the current environment name to keep environments completely distinct.
* VPC: `${var.environment}-vpc`
* Security Groups: `${var.environment}-sg`, `${var.environment}-master-sg`
* Instances: `${var.environment}-master-node`, `${var.environment}-worker-node-1`

### Required Tagging
The AWS provider automatically applies default tags to all resources:
* **Environment**: `dev` / `stage` / `prod`
* **Project**: `Kubernetes-Lab` (Default)
* **ManagedBy**: `Terraform`
* **Owner**: `DevOps-Team`
* **CostCenter**: `Infrastructure-101`

---

## Deployment Instructions

### Prerequisites
1. Installed **AWS CLI v2** and run `aws configure`.
2. Existing key pair in AWS named `AWS-Key` (override with `key_name` variable).
3. Private key file saved locally at `~/keys/AWS-Key.pem` (with `chmod 400`).
4. An S3 bucket named `shopsphere-terraform-state` and DynamoDB Table `terraform-locks` (or update respective `environments/*-backend.tfvars` files).

### Step 1: Provision Infrastructure with Terraform
Navigate to the `terraform/` directory:
```bash
cd terraform
```

#### Choose your target environment:

##### A. Development (dev)
```bash
terraform init -backend-config=environments/dev-backend.tfvars
terraform apply -var-file=environments/dev.tfvars -auto-approve
```

##### B. Staging (stage)
```bash
terraform init -backend-config=environments/stage-backend.tfvars
terraform apply -var-file=environments/stage.tfvars -auto-approve
```

##### C. Production (prod)
```bash
terraform init -backend-config=environments/prod-backend.tfvars
terraform apply -var-file=environments/prod.tfvars -auto-approve
```

This will automatically output compute IPs/EKS connection commands and generate the corresponding Ansible inventory under `ansible/inventories/<env>_hosts.ini`.

---

### Step 2: Configure Workloads with Ansible
Navigate to the `ansible/` directory:
```bash
cd ../ansible
```

#### Run the appropriate playbook:

##### A. Development (dev)
```bash
ansible-playbook -i inventories/dev_hosts.ini playbooks/dev-setup.yml
```

##### B. Staging (stage)
```bash
ansible-playbook -i inventories/stage_hosts.ini playbooks/stage-setup.yml
```

##### C. Production (prod)
```bash
ansible-playbook -i inventories/prod_hosts.ini playbooks/prod-setup.yml
```

---

## Engineering Recommendations

### 1. Cost Optimization
* **EIP and NAT Gateway Conditional Provisioning**: In our Terraform configuration, Elastic IPs and NAT Gateways are *only* created if private subnets exist. This saves ~$32/month in Development, which has only public subnets.
* **Instance Type Management**: All compute instances default to `t3.medium` to handle Kind/kubeadm cluster overhead, but are fully parameterizable.
* **EKS Managed Node Auto-scaling**: In Prod, EKS cluster autoscaler automatically scales workers down to a minimum of 2 nodes during off-peak hours.

### 2. Security Best Practices
* **Bastion-less Workers**: Workers in Staging run in private subnets and are accessed via master nodes. No worker exposes SSH to the open internet.
* **Least Privilege IAM**: All roles (EKS, nodes, autoscaler) carry only permissions mandatory for their functions. No wildcards (`*`) are used on sensitive write operations.
* **OIDC Integration (IRSA)**: Production EKS uses OIDC web identity federation. Applications like the AWS Load Balancer Controller authenticate using JWT tokens mapped to IAM roles rather than AWS credentials stored on EKS nodes.

### 3. Production Best Practices
* **State Locking**: DynamoDB state locking prevents race conditions and corrupted states.
* **Encrypted State**: S3 bucket encryption is enforced on states to protect sensitive values (such as SSH passwords/tokens).
* **SystemdCgroup containerd config**: Pinning `SystemdCgroup` prevents out-of-memory container crashes on kubeadm clusters.
