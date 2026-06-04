module "vpc" {
  source = "./modules/vpc"

  vpc_cidr     = var.vpc_cidr
  environment  = var.environment
  project_name = var.project_name
}

module "networking" {
  source = "./modules/networking"

  vpc_id               = module.vpc.vpc_id
  igw_id               = module.vpc.igw_id
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  environment          = var.environment
  aws_region           = var.aws_region
}

module "security_group" {
  source = "./modules/security-group"

  vpc_id      = module.vpc.vpc_id
  environment = var.environment
}

module "iam" {
  source = "./modules/iam"

  environment       = var.environment
  project_name      = var.project_name
  oidc_provider_arn = module.eks.oidc_provider_arn
  oidc_provider_url = module.eks.oidc_provider_url
}

module "ec2" {
  source = "./modules/ec2"

  environment                = var.environment
  project_name               = var.project_name
  key_name                   = var.key_name
  public_subnet_ids          = module.networking.public_subnet_ids
  private_subnet_ids         = module.networking.private_subnet_ids
  dev_instance_type          = var.dev_instance_type
  stage_master_instance_type = var.stage_master_instance_type
  stage_worker_instance_type = var.stage_worker_instance_type
  dev_sg_id                  = module.security_group.dev_sg_id
  stage_master_sg_id         = module.security_group.stage_master_sg_id
  stage_worker_sg_id         = module.security_group.stage_worker_sg_id
}

module "eks" {
  source = "./modules/eks"

  environment        = var.environment
  project_name       = var.project_name
  cluster_role_arn   = module.iam.eks_cluster_role_arn
  node_role_arn      = module.iam.eks_node_role_arn
  public_subnet_ids  = module.networking.public_subnet_ids
  private_subnet_ids = module.networking.private_subnet_ids
  eks_cluster_sg_id  = module.security_group.eks_cluster_sg_id
  eks_node_sg_id     = module.security_group.eks_node_sg_id
  instance_types     = var.prod_node_instance_types
  desired_size       = var.prod_node_desired_size
  min_size           = var.prod_node_min_size
  max_size           = var.prod_node_max_size
}

# ==================== DYNAMIC INVENTORY GENERATION ====================
resource "local_file" "ansible_inventory" {
  filename = "${path.module}/../ansible/inventories/${var.environment}_hosts.ini"

  content = var.environment == "dev" ? <<EOT
[dev]
${module.ec2.dev_public_ip} ansible_user=ubuntu ansible_ssh_private_key_file=~/keys/${var.key_name}.pem
EOT
  : var.environment == "stage" ? <<EOT
[master]
${module.ec2.stage_master_public_ip} ansible_user=ubuntu ansible_ssh_private_key_file=~/keys/${var.key_name}.pem

[workers]
%{for ip in module.ec2.stage_worker_private_ips~}
${ip} ansible_user=ubuntu ansible_ssh_private_key_file=~/keys/${var.key_name}.pem ansible_ssh_common_args='-o ProxyCommand="ssh -W %h:%p -q ubuntu@${module.ec2.stage_master_public_ip} -i ~/keys/${var.key_name}.pem"'
%{endfor~}
EOT
  : <<EOT
[localhost]
localhost ansible_connection=local
EOT
}
