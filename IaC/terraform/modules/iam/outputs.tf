output "eks_cluster_role_arn" {
  description = "The ARN of the EKS cluster role"
  value       = try(aws_iam_role.eks_cluster[0].arn, null)
}

output "eks_node_role_arn" {
  description = "The ARN of the EKS worker nodes role"
  value       = try(aws_iam_role.eks_nodes[0].arn, null)
}

output "cluster_autoscaler_role_arn" {
  description = "The ARN of the Cluster Autoscaler IAM role"
  value       = try(aws_iam_role.cluster_autoscaler[0].arn, null)
}

output "alb_controller_role_arn" {
  description = "The ARN of the AWS Load Balancer Controller IAM role"
  value       = try(aws_iam_role.aws_load_balancer_controller[0].arn, null)
}
