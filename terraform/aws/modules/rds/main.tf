resource "random_password" "db_password" {
  length  = 18
  lower   = true
  special = false
  upper   = true

  min_lower   = 3
  min_numeric = 3
  min_upper   = 3

  keepers = {
    pass_version = 1
  }
}

resource "aws_db_parameter_group" "postgres" {
  name   = "${var.prefix}-pg-param-group-${var.environment}"
  family = "postgres16"

  tags = {
    prefix      = var.prefix
    environment = var.environment
  }
}

resource "aws_db_instance" "postgres" {
  identifier             = "${var.prefix}-postgres-${var.environment}"
  engine                 = "postgres"
  engine_version         = "16"
  instance_class         = "db.t4g.micro"
  allocated_storage      = 20
  max_allocated_storage  = 100
  storage_type           = "gp3"
  storage_encrypted      = true
  db_name                = "${var.prefix}postgdb${var.environment}"
  username               = "psqladmin"
  password               = random_password.db_password.result
  parameter_group_name   = aws_db_parameter_group.postgres.name
  vpc_security_group_ids = [var.database_security_group_id]
  db_subnet_group_name   = var.db_subnet_group_name
  skip_final_snapshot    = true
  multi_az               = false
  publicly_accessible    = false
  backup_retention_period = 7
  deletion_protection    = false

  tags = {
    prefix      = var.prefix
    environment = var.environment
  }
}
