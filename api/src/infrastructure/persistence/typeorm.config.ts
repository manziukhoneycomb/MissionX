import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const DEFAULT_DB_HOST = 'localhost';
const DEFAULT_DB_PORT = 5432;
const DEFAULT_DB_USERNAME = 'postgres';
const DEFAULT_DB_PASSWORD = 'postgres';
const DEFAULT_DB_DATABASE = 'postgres';

const DECIMAL_RADIX = 10;
const DB_HOST = process.env.DB_HOST || DEFAULT_DB_HOST;
const DB_PORT = process.env.DB_PORT
    ? parseInt(process.env.DB_PORT, DECIMAL_RADIX)
    : DEFAULT_DB_PORT;
const DB_USERNAME = process.env.DB_USERNAME || DEFAULT_DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD || DEFAULT_DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE || DEFAULT_DB_DATABASE;
const DB_SSL = process.env.DB_SSL === 'true';

// For NestJS TypeORM Module
export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: configService.get('DB_HOST', 'db'),
    port: configService.get('DB_PORT', DEFAULT_DB_PORT),
    username: configService.get('DB_USERNAME', DEFAULT_DB_USERNAME),
    password: configService.get('DB_PASSWORD', DEFAULT_DB_PASSWORD),
    database: configService.get('DB_DATABASE', DEFAULT_DB_DATABASE),
    entities: [path.join(__dirname, '..', '..', 'domain', 'entities', '*.entity{.ts,.js}')],
    migrations: [path.join(__dirname, 'migrations', '**', '*{.ts,.js}')],
    logging: configService.get('DB_LOGGING', 'false') === 'true',
    ssl: configService.get('DB_SSL', 'false') === 'true',
});

// For TypeORM CLI migrations
export default new DataSource({
    type: 'postgres',
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    entities: [path.join(__dirname, '..', '..', 'domain', 'entities', '*.entity{.ts,.js}')],
    migrations: [path.join(__dirname, 'migrations', '**', '*{.ts,.js}')],
    synchronize: false,
    ssl: DB_SSL
        ? {
              rejectUnauthorized: false,
          }
        : false,
});
