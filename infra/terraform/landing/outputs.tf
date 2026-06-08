output "bucket_name" {
  description = "S3 bucket that stores the landing site files."
  value       = aws_s3_bucket.site.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution identifier used for invalidations."
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain_name" {
  description = "Default CloudFront hostname."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "site_url" {
  description = "Primary landing URL."
  value       = "https://${var.domain_name}"
}
