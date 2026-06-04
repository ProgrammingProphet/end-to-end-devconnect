#!/bin/bash

# Root folder
ROOT="shopshere-terraform"

# Create directories
mkdir -p $ROOT/modules/{vpc,ec2,alb,rds,security_group}
mkdir -p $ROOT/environments/{dev,prod}
mkdir -p $ROOT/global/s3-backend

# Create module files
for module in vpc ec2 alb rds security_group; do
  touch $ROOT/modules/$module/main.tf
  touch $ROOT/modules/$module/variables.tf
  touch $ROOT/modules/$module/outputs.tf
done

# Create environment files
for env in dev prod; do
  touch $ROOT/environments/$env/main.tf
  touch $ROOT/environments/$env/variables.tf
  touch $ROOT/environments/$env/terraform.tfvars
  touch $ROOT/environments/$env/backend.tf
done

# Create global files
touch $ROOT/global/s3-backend/main.tf
touch $ROOT/global/s3-backend/variables.tf

# Create root-level files
touch $ROOT/provider.tf
touch $ROOT/variables.tf
touch $ROOT/outputs.tf
touch $ROOT/versions.tf
touch $ROOT/.gitignore
touch $ROOT/README.md

echo "Terraform project structure created successfully!"