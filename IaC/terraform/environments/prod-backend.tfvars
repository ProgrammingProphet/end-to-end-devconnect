bucket         = "shopsphere-terraform-state"
key            = "prod/terraform.tfstate"
region         = "ap-south-1"
dynamodb_table = "terraform-locks"
encrypt        = true
