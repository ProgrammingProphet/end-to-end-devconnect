output "eks_cluster_name" {
  description = "The name of the EKS cluster"
  value       = try(aws_eks_cluster.this[0].name, null)
}

output "eks_cluster_endpoint" {
  description = "The endpoint of the EKS cluster"
  value       = try(aws_eks_cluster.this[0].endpoint, null)
}

output "eks_cluster_certificate_authority" {
  description = "The certificate authority data for the EKS cluster"
  value       = try(aws_eks_cluster.this[0].certificate_authority[0].data, null)
}

output "oidc_provider_arn" {
  description = "The ARN of the OIDC Provider"
  value       = try(aws_iam_openid_connect_provider.eks[0].arn, "")
}

output "oidc_provider_url" {
  description = "The URL of the OIDC Provider"
  value       = try(aws_iam_openid_connect_provider.eks[0].url, "")
}
