output "dev_sg_id" {
  description = "The ID of the Dev security group"
  value       = try(aws_security_group.dev[0].id, null)
}

output "stage_master_sg_id" {
  description = "The ID of the Staging master security group"
  value       = try(aws_security_group.stage_master[0].id, null)
}

output "stage_worker_sg_id" {
  description = "The ID of the Staging worker security group"
  value       = try(aws_security_group.stage_worker[0].id, null)
}

output "eks_cluster_sg_id" {
  description = "The ID of the EKS cluster security group"
  value       = try(aws_security_group.eks_cluster[0].id, null)
}

output "eks_node_sg_id" {
  description = "The ID of the EKS node security group"
  value       = try(aws_security_group.eks_nodes[0].id, null)
}
