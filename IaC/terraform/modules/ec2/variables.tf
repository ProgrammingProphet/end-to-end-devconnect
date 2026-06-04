variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "key_name" {
  description = "Name of key pair to associate with EC2 instances"
  type        = string
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs"
  type        = list(string)
  default     = []
}

variable "dev_instance_type" {
  description = "EC2 instance type for Dev"
  type        = string
  default     = "t3.medium"
}

variable "stage_master_instance_type" {
  description = "EC2 instance type for Staging Master"
  type        = string
  default     = "t3.medium"
}

variable "stage_worker_instance_type" {
  description = "EC2 instance type for Staging Workers"
  type        = string
  default     = "t3.medium"
}

variable "dev_sg_id" {
  description = "Security Group ID for Dev"
  type        = string
  default     = ""
}

variable "stage_master_sg_id" {
  description = "Security Group ID for Staging Master"
  type        = string
  default     = ""
}

variable "stage_worker_sg_id" {
  description = "Security Group ID for Staging Workers"
  type        = string
  default     = ""
}
