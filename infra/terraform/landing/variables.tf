variable "aws_region" {
  description = "Primary AWS region for the S3 bucket and CloudFront control resources."
  type        = string
  default     = "sa-east-1"
}

variable "domain_name" {
  description = "Fully qualified domain name used by CloudFront."
  type        = string
  default     = "devhora.lucas-tavares.com"
}

variable "hosted_zone_name" {
  description = "Public Route53 hosted zone name that already exists in the AWS account."
  type        = string
  default     = "lucas-tavares.com"
}

variable "price_class" {
  description = "CloudFront price class."
  type        = string
  default     = "PriceClass_100"
}

variable "tags" {
  description = "Optional tags to apply to AWS resources."
  type        = map(string)
  default = {
    Project = "DevHora"
    Stack   = "landing"
  }
}
