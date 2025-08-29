resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name        = "${var.prefix}-vpc-${var.environment}"
    prefix      = var.prefix
    environment = var.environment
  }
}

resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index}.0/24"
  availability_zone       = "${var.region}${count.index == 0 ? "a" : "b"}"
  map_public_ip_on_launch = true

  tags = {
    Name        = "${var.prefix}-public-subnet-${count.index}-${var.environment}"
    prefix      = var.prefix
    environment = var.environment
  }
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 2}.0/24"
  availability_zone = "${var.region}${count.index == 0 ? "a" : "b"}"

  tags = {
    Name        = "${var.prefix}-private-subnet-${count.index}-${var.environment}"
    prefix      = var.prefix
    environment = var.environment
  }
}

resource "aws_subnet" "database" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 4}.0/24"
  availability_zone = "${var.region}${count.index == 0 ? "a" : "b"}"

  tags = {
    Name        = "${var.prefix}-db-subnet-${count.index}-${var.environment}"
    prefix      = var.prefix
    environment = var.environment
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "${var.prefix}-igw-${var.environment}"
    prefix      = var.prefix
    environment = var.environment
  }
}

resource "aws_eip" "nat" {
  domain = "vpc"

  tags = {
    Name        = "${var.prefix}-eip-${var.environment}"
    prefix      = var.prefix
    environment = var.environment
  }
}

resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id

  tags = {
    Name        = "${var.prefix}-nat-${var.environment}"
    prefix      = var.prefix
    environment = var.environment
  }

  depends_on = [aws_internet_gateway.igw]
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name        = "${var.prefix}-public-rt-${var.environment}"
    prefix      = var.prefix
    environment = var.environment
  }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat.id
  }

  tags = {
    Name        = "${var.prefix}-private-rt-${var.environment}"
    prefix      = var.prefix
    environment = var.environment
  }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = 2
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "database" {
  count          = 2
  subnet_id      = aws_subnet.database[count.index].id
  route_table_id = aws_route_table.private.id
}

resource "aws_db_subnet_group" "database" {
  name       = "${var.prefix}-db-subnet-group-${var.environment}"
  subnet_ids = aws_subnet.database[*].id

  tags = {
    Name        = "${var.prefix}-db-subnet-group-${var.environment}"
    prefix      = var.prefix
    environment = var.environment
  }
}

resource "aws_security_group" "ecs_tasks" {
  name        = "${var.prefix}-ecs-tasks-sg-${var.environment}"
  description = "Allow inbound traffic to ECS tasks"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.prefix}-ecs-tasks-sg-${var.environment}"
    prefix      = var.prefix
    environment = var.environment
  }
}

resource "aws_security_group" "alb" {
  name        = "${var.prefix}-alb-sg-${var.environment}"
  description = "Allow inbound traffic to ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.prefix}-alb-sg-${var.environment}"
    prefix      = var.prefix
    environment = var.environment
  }
}

resource "aws_security_group" "database" {
  name        = "${var.prefix}-db-sg-${var.environment}"
  description = "Allow inbound traffic to database"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.prefix}-db-sg-${var.environment}"
    prefix      = var.prefix
    environment = var.environment
  }
}
