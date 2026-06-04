output "dev_public_ip" {
  description = "The public IP of the Dev instance"
  value       = try(aws_instance.dev[0].public_ip, null)
}

output "dev_private_ip" {
  description = "The private IP of the Dev instance"
  value       = try(aws_instance.dev[0].private_ip, null)
}

output "stage_master_public_ip" {
  description = "The public IP of the Staging master node"
  value       = try(aws_instance.stage_master[0].public_ip, null)
}

output "stage_master_private_ip" {
  description = "The private IP of the Staging master node"
  value       = try(aws_instance.stage_master[0].private_ip, null)
}

output "stage_worker_private_ips" {
  description = "The private IPs of the Staging worker nodes"
  value       = aws_instance.stage_worker[*].private_ip
}
