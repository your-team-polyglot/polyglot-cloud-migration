variable "aws_region" {
  description = "AWS region to deploy resources into"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (dev / staging / prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project identifier used in resource names"
  type        = string
  default     = "polyglot"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.small"
}

variable "key_name" {
  description = "Name of the existing AWS key pair for SSH access"
  type        = string
}

variable "my_ip_cidr" {
  description = "Your public IP in CIDR notation for SSH access (e.g. 203.0.113.10/32)"
  type        = string
}

variable "docker_username" {
  description = "Docker Hub username used when pulling images"
  type        = string
}

variable "image_tag" {
  description = "Docker image tag to deploy"
  type        = string
  default     = "latest"
}
