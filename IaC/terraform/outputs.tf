output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "The IDs of the public subnets"
  value       = module.networking.public_subnet_ids
}

output "private_subnet_ids" {
  description = "The IDs of the private subnets"
  value       = module.networking.private_subnet_ids
}

# ==================== DEVELOPMENT OUTPUTS ====================
output "dev_public_ip" {
  description = "The public IP of the Dev instance"
  value       = module.ec2.dev_public_ip
}

output "dev_private_ip" {
  description = "The private IP of the Dev instance"
  value       = module.ec2.dev_private_ip
}

output "dev_ssh_command" {
  description = "The SSH command to connect to the Dev instance"
  value       = module.ec2.dev_public_ip != null ? "ssh -i ~/keys/${var.key_name}.pem ubuntu@${module.ec2.dev_public_ip}" : null
}


# ==================== STAGING OUTPUTS ====================
output "stage_master_public_ip" {
  description = "The public IP of the Staging master node"
  value       = module.ec2.stage_master_public_ip
}

output "stage_master_private_ip" {
  description = "The private IP of the Staging master node"
  value       = module.ec2.stage_master_private_ip
}

output "stage_master_ssh_command" {
  description = "The SSH command to connect to the Staging master node"
  value       = module.ec2.stage_master_public_ip != null ? "ssh -i ~/keys/${var.key_name}.pem ubuntu@${module.ec2.stage_master_public_ip}" : null
}

output "stage_worker_private_ips" {
  description = "The private IPs of the Staging worker nodes"
  value       = module.ec2.stage_worker_private_ips
}

output "stage_worker_ssh_commands" {
  description = "The SSH commands to connect to the Staging worker nodes (via master node bastion)"
  value       = [
    for ip in module.ec2.stage_worker_private_ips :
    "ssh -i ~/keys/${var.key_name}.pem -o ProxyCommand=\"ssh -i ~/keys/${var.key_name}.pem -W %h:%p ubuntu@${module.ec2.stage_master_public_ip}\" ubuntu@${ip}"
  ]
}


# ==================== PRODUCTION OUTPUTS ====================
output "eks_cluster_name" {
  description = "The name of the EKS cluster"
  value       = module.eks.eks_cluster_name
}

output "eks_cluster_endpoint" {
  description = "The endpoint of the EKS cluster"
  value       = module.eks.eks_cluster_endpoint
}

output "eks_kubeconfig_command" {
  description = "Command to update local kubeconfig for EKS cluster"
  value       = module.eks.eks_cluster_name != null ? "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.eks_cluster_name}" : null
}
