variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "ap-south-1"
}

variable "environment" {
  description = "The deployment environment (dev, stage, prod)"
  type        = string
}

variable "project_name" {
  description = "Name of the project used for naming resources and tags"
  type        = string
  default     = "Kubernetes-Lab"
}

variable "owner" {
  description = "Owner tag value"
  type        = string
  default     = "DevOps-Team"
}

variable "cost_center" {
  description = "CostCenter tag value"
  type        = string
  default     = "Infrastructure-101"
}

variable "key_name" {
  description = "Name of the existing EC2 Key Pair in AWS"
  type        = string
  default     = "AWS-Key"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
}

# Dev Environment variables
variable "dev_instance_type" {
  description = "EC2 instance type for Development environment"
  type        = string
  default     = "t3.medium" # Kind cluster needs at least 2 vCPUs/4GB RAM, so t3.medium is ideal
}

# Staging Environment variables
variable "stage_master_instance_type" {
  description = "EC2 instance type for Staging Master node"
  type        = string
  default     = "t3.medium" # kubeadm master requires 2 vCPUs / 2GB RAM minimum
}

variable "stage_worker_instance_type" {
  description = "EC2 instance type for Staging Worker nodes"
  type        = string
  default     = "t3.medium"
}

# Production Environment variables
variable "prod_node_instance_types" {
  description = "EC2 instance types for EKS managed node group"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "prod_node_min_size" {
  description = "Minimum number of worker nodes in EKS Node Group"
  type        = number
  default     = 2
}

variable "prod_node_max_size" {
  description = "Maximum number of worker nodes in EKS Node Group"
  type        = number
  default     = 5
}

variable "prod_node_desired_size" {
  description = "Desired number of worker nodes in EKS Node Group"
  type        = number
  default     = 2
}
