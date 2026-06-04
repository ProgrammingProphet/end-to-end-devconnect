variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "oidc_provider_arn" {
  description = "OIDC Provider ARN for EKS"
  type        = string
  default     = ""
}

variable "oidc_provider_url" {
  description = "OIDC Provider URL for EKS"
  type        = string
  default     = ""
}
