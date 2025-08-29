import '../../instrument.mjs';

import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe, Logger, INestApplication } from '@nestjs/common';
import {
    IUserRepository,
    USER_REPOSITORY,
} from '../application/repositories/user.repository.interface';
import {
    IRoleRepository,
    ROLE_REPOSITORY,
} from '../application/repositories/role.repository.interface';
import { RoleName } from '../domain/enums/role-name.enum';
import { CreateUserBySuperAdminDto } from '../application/users/dto/create-user.dto';
import {
    USER_COMMANDS,
    IUserCommands,
} from '../application/users/interfaces/user-commands.interface';
import { extractErrorInfo } from '../domain/utils/error.utils';
import { DataSource } from 'typeorm';
import { setupSwaggerDocs } from './swagger/swagger.config';
import { setupScalarDocs } from './swagger/scalar.config';
import { UnhandledExceptionFilter } from './filters/unhandled-exception.filter';
import {
    ITenantRepository,
    TENANT_REPOSITORY,
} from '../application/repositories/tenant.repository.interface';
import {
    ITenantCommands,
    TENANT_COMMANDS,
} from '../application/tenants/interfaces/tenant-commands.interface';

const DEFAULT_PORT = 5000;
const DEFAULT_CLIENT_URL = 'http://localhost:3000';
const DEFAULT_LANDING_URL = 'http://localhost:3001';
const DEFAULT_CORS_ORIGINS = [DEFAULT_CLIENT_URL, DEFAULT_LANDING_URL];

async function bootstrap() {
    const logger = new Logger('Bootstrap');

    try {
        const app = await NestFactory.create(AppModule);

        app.useGlobalFilters(new UnhandledExceptionFilter(app.get(HttpAdapterHost)));

        const port = process.env.PORT ?? DEFAULT_PORT;

        const dataSource = app.get(DataSource);
        await dataSource.runMigrations();

        await createDefaultSuperAdmin(app, logger);
        await createDefaultTenants(app, logger);

        app.enableCors({
            origin: process.env.CORS_ORIGIN
                ? process.env.CORS_ORIGIN.split(',').map((origin: string) => origin.trim())
                : DEFAULT_CORS_ORIGINS,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            credentials: true,
        });

        app.use(cookieParser());

        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );

        app.setGlobalPrefix('api');

        if (process.env.NODE_ENV !== 'production') {
            setupSwaggerDocs(app);
            setupScalarDocs(app);
        }

        await app.listen(port);

        console.log(`Server is running on port ${port}`);
    } catch (error: unknown) {
        const { message, stack } = extractErrorInfo(error, 'Error starting server');

        console.error('Error starting server:', message, stack);
        process.exit(1);
    }
}

async function createDefaultTenants(app: INestApplication, logger: Logger): Promise<void> {
    const data = [
        {
            tenantName: 'Houston AutoParts Inc.',
            tenantAlias: 'houstonautopartsinc',
            adminFirstName: 'Houston',
            adminLastName: 'AutoParts',
            adminEmail: 'bogib14126@nutrv.com',
        },
        {
            tenantName: 'PowerTorque Systems Inc.',
            tenantAlias: 'powertorquesystemsinc',
            adminFirstName: 'Power',
            adminLastName: 'Torque',
            adminEmail: 'zt0a1@chefalicious.com',
        },
        {
            tenantName: 'MetroDrive Components',
            tenantAlias: 'metrodrivecomponents',
            adminFirstName: 'Metro',
            adminLastName: 'Drive',
            adminEmail: 'ko3ux@chefalicious.com',
        },
        {
            tenantName: 'H-Town Motor Supply',
            tenantAlias: 'htownmotorsupply',
            adminFirstName: 'H-Town',
            adminLastName: 'Motor',
            adminEmail: 'x5m3l@chefalicious.com',
        },
    ];

    const tenantRepository = app.get<ITenantRepository>(TENANT_REPOSITORY);
    const tenantCommands = app.get<ITenantCommands>(TENANT_COMMANDS);
    const userCommands = app.get<IUserCommands>(USER_COMMANDS);
    const roleRepository = app.get<IRoleRepository>(ROLE_REPOSITORY);

    const adminRole = await roleRepository.findByName(RoleName.ADMIN);
    const userRole = await roleRepository.findByName(RoleName.USER);

    for (const item of data) {
        let tenant = await tenantRepository.findByName(item.tenantName);

        if (!tenant) {
            tenant = await tenantCommands.createTenant({
                name: item.tenantName,
                alias: item.tenantAlias,
            });

            await userCommands.createUser(
                {
                    firstName: item.adminFirstName,
                    lastName: item.adminLastName,
                    email: item.adminEmail,
                    roleIds: [adminRole!.id, userRole!.id],
                },
                tenant.id,
            );
        }
    }
}

async function createDefaultSuperAdmin(app: INestApplication, logger: Logger): Promise<void> {
    const superAdminEmail = process.env.DEFAULT_SUPER_ADMIN_EMAIL;

    if (!superAdminEmail) {
        logger.warn(
            'DEFAULT_SUPER_ADMIN_EMAIL environment variable not set. Skipping super admin creation.',
        );

        return;
    }

    const userRepository = app.get<IUserRepository>(USER_REPOSITORY);
    const roleRepository = app.get<IRoleRepository>(ROLE_REPOSITORY);
    const userCommands = app.get<IUserCommands>(USER_COMMANDS);

    try {
        const existingUser = await userRepository.findByEmail(superAdminEmail);

        if (existingUser) {
            return;
        }

        const superAdminRole = await roleRepository.findByName(RoleName.SUPER_ADMIN);
        const adminRole = await roleRepository.findByName(RoleName.ADMIN);

        const superAdminDto = new CreateUserBySuperAdminDto();

        superAdminDto.email = superAdminEmail;
        superAdminDto.roleIds = [superAdminRole!.id];

        await userCommands.createUserBySuperAdmin(superAdminDto);
    } catch (error: unknown) {
        const { message, stack } = extractErrorInfo(error);

        logger.error(
            `Failed to create super admin user ${superAdminEmail}. Error: ${message}`,
            stack,
        );
    }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
