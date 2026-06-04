data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ==================== DEVELOPMENT EC2 INSTANCE ====================
resource "aws_instance" "dev" {
  count                       = var.environment == "dev" ? 1 : 0
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.dev_instance_type
  subnet_id                   = var.public_subnet_ids[0]
  vpc_security_group_ids      = [var.dev_sg_id]
  key_name                    = var.key_name
  associate_public_ip_address = true

  root_block_device {
    volume_size           = 30 # Kind cluster overhead
    volume_type           = "gp3"
    delete_on_termination = true
  }

  tags = {
    Name = "${var.environment}-ec2"
  }
}


# ==================== STAGING MASTER NODE ====================
resource "aws_instance" "stage_master" {
  count                       = var.environment == "stage" ? 1 : 0
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.stage_master_instance_type
  subnet_id                   = var.public_subnet_ids[0]
  vpc_security_group_ids      = [var.stage_master_sg_id]
  key_name                    = var.key_name
  associate_public_ip_address = true

  root_block_device {
    volume_size           = 25
    volume_type           = "gp3"
    delete_on_termination = true
  }

  tags = {
    Name = "${var.environment}-master-node"
  }
}


# ==================== STAGING WORKER NODES ====================
resource "aws_instance" "stage_worker" {
  count                       = var.environment == "stage" ? 2 : 0
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.stage_worker_instance_type
  subnet_id                   = var.private_subnet_ids[count.index % length(var.private_subnet_ids)]
  vpc_security_group_ids      = [var.stage_worker_sg_id]
  key_name                    = var.key_name
  associate_public_ip_address = false

  root_block_device {
    volume_size           = 25
    volume_type           = "gp3"
    delete_on_termination = true
  }

  tags = {
    Name = "${var.environment}-worker-node-${count.index + 1}"
  }
}
