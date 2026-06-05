output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.app.id
}

output "public_ip" {
  description = "Elastic IP address of the app server"
  value       = aws_eip.app.public_ip
}

output "public_dns" {
  description = "Public DNS name of the app server"
  value       = aws_instance.app.public_dns
}

output "frontend_url" {
  description = "URL to access the frontend"
  value       = "http://${aws_eip.app.public_ip}:3000"
}

output "api_url" {
  description = "URL to access the .NET API"
  value       = "http://${aws_eip.app.public_ip}:8080/api/status"
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i your-key.pem ec2-user@${aws_eip.app.public_ip}"
}
