resource "aws_s3_bucket" "app_storage" {
  bucket = "${var.prefix}-storage-${var.environment}"

  tags = {
    prefix      = var.prefix
    environment = var.environment
  }
}

resource "aws_s3_bucket_ownership_controls" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "app_storage" {
  depends_on = [aws_s3_bucket_ownership_controls.app_storage]
  bucket     = aws_s3_bucket.app_storage.id
  acl        = "private"
}

resource "aws_s3_bucket_versioning" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id

  rule {
    id     = "cleanup-old-versions"
    status = "Enabled"

    filter {
      prefix = ""  # Empty prefix means apply to all objects
    }

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
}

resource "aws_s3_bucket_public_access_block" "app_storage" {
  bucket                  = aws_s3_bucket.app_storage.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
