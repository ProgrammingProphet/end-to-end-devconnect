variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "cluster_role_arn" {
  description = "IAM Role ARN for the EKS Cluster"
  type        = string
  default     = ""
}

variable "node_role_arn" {
  description = "IAM Role ARN for the EKS Worker Nodes"
  type        = string
  default     = ""
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs"
  type        = list(string)
}

variable "eks_cluster_sg_id" {
  description = "Security group ID for EKS Cluster"
  type        = string
  default     = ""
}

variable "eks_node_sg_id" {
  description = "Security group ID for EKS Nodes"
  type        = string
  default     = ""
}

variable "instance_types" {
  description = "List of instance types for EKS Worker Nodes"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "desired_size" {
  description = "Desired number of worker nodes"
  type        = number
  default     = 2
}

variable "min_size" {
  description = "Minimum number of worker nodes"
  type        = number
  default     = 2
}

variable "max_size" {
  description = "Maximum number of worker nodes"
  type        = number
  default     = 5
}
