# ==================== EKS CLUSTER ====================
resource "aws_eks_cluster" "this" {
  count    = var.environment == "prod" ? 1 : 0
  name     = "${var.environment}-eks"
  role_arn = var.cluster_role_arn

  vpc_config {
    subnet_ids              = concat(var.public_subnet_ids, var.private_subnet_ids)
    security_group_ids      = [var.eks_cluster_sg_id]
    endpoint_private_access = true
    endpoint_public_access  = true
  }

  tags = {
    Name = "${var.environment}-eks"
  }
}


# ==================== EKS WORKER NODE GROUP ====================
resource "aws_eks_node_group" "this" {
  count           = var.environment == "prod" ? 1 : 0
  cluster_name    = aws_eks_cluster.this[0].name
  node_group_name = "${var.environment}-nodegroup"
  node_role_arn   = var.node_role_arn
  subnet_ids      = var.private_subnet_ids # Private subnets for nodes

  instance_types = var.instance_types

  scaling_config {
    desired_size = var.desired_size
    min_size     = var.min_size
    max_size     = var.max_size
  }

  update_config {
    max_unavailable = 1
  }

  tags = {
    Name = "${var.environment}-nodegroup"
  }
}


# ==================== OIDC IDENTITY PROVIDER ====================
data "tls_certificate" "eks" {
  count = var.environment == "prod" ? 1 : 0
  url   = aws_eks_cluster.this[0].identity[0].oidc[0].issuer
}

resource "aws_iam_openid_connect_provider" "eks" {
  count           = var.environment == "prod" ? 1 : 0
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.eks[0].certificates[0].sha1_fingerprint]
  url             = aws_eks_cluster.this[0].identity[0].oidc[0].issuer

  tags = {
    Name = "${var.environment}-eks-oidc"
  }
}
