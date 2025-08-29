terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~>5.0"
    }
  }

  # IMPORTANT #
  # This will upload the terraform state to S3
  # Variables are not allowed here, you should specify names explicitly
  backend "s3" {
    bucket       = "ai-templateapp-tfstate-bucket"
    key          = "ai_template_test_terraform.tfstate"
    region       = "eu-west-1"
    encrypt      = true
    use_lockfile = true
  }

  required_version = ">= 1.1.0"
}

provider "aws" {
  region = var.region
}

data "aws_caller_identity" "current" {}

resource "aws_resourcegroups_group" "rg" {
  name = "${var.prefix}-rg-${var.environment}"

  resource_query {
    query = jsonencode({
      ResourceTypeFilters = ["AWS::AllSupported"]
      TagFilters = [
        {
          Key    = "prefix"
          Values = [var.prefix]
        },
        {
          Key    = "environment"
          Values = [var.environment]
        }
      ]
    })
  }

  tags = {
    prefix      = var.prefix
    environment = var.environment
  }
}

module "vpc" {
  source      = "./modules/vpc"
  prefix      = var.prefix
  environment = var.environment
  region      = var.region
}

module "ecr" {
  source      = "./modules/ecr"
  prefix      = var.prefix
  environment = var.environment
}

module "ecs" {
  source      = "./modules/ecs"
  prefix      = var.prefix
  environment = var.environment
  region      = var.region
}

module "app_services" {
  source                 = "./modules/app_services"
  prefix                 = var.prefix
  environment            = var.environment
  region                 = var.region
  ecs_cluster_id         = module.ecs.ecs_cluster_id
  ecr_repository_url     = module.ecr.ecr_repository_url
  vpc_id                 = module.vpc.vpc_id
  public_subnets         = module.vpc.public_subnets
  private_subnets        = module.vpc.private_subnets
  database_host          = module.rds.db_endpoint
  database_username      = module.rds.db_username
  database_password      = module.rds.db_password
  database_name          = module.rds.db_name
  ecs_security_group_id  = module.vpc.ecs_security_group_id
  alb_security_group_id  = module.vpc.alb_security_group_id
  client_repository_url  = module.ecr.client_repository_url
  landing_repository_url = module.ecr.landing_repository_url
}

module "secrets_manager" {
  source            = "./modules/secrets_manager"
  prefix            = var.prefix
  environment       = var.environment
  api_task_role_arn = module.app_services.api_task_role_arn
}

module "rds" {
  source          = "./modules/rds"
  prefix          = var.prefix
  environment     = var.environment
  vpc_id          = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnets
}

module "s3" {
  source      = "./modules/s3"
  prefix      = var.prefix
  environment = var.environment
}
