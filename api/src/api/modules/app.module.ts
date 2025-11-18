import { Module, MiddlewareConsumer, NestModule, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SentryModule } from '@sentry/nestjs/setup';
import { PersistenceModule } from '../../infrastructure/persistence/persistence.module';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { TenantModule } from '../../application/tenants/tenant.module';
import { UserModule } from '../../application/users/user.module';
import { RolesModule } from '../../application/roles/roles.module';
import { TenantMiddleware } from '../../infrastructure/middleware/tenant.middleware';
import { RolesController } from '../controllers/roles.controller';
import { TenantController } from '../controllers/tenant.controller';
import { UserController } from '../controllers/user.controller';
import { SecretsModule } from '../../application/secrets/secrets.module';
import { SecretsController } from '../controllers/secrets.controller';
import { LlmModule } from '../../infrastructure/llm/modules/llm.module';
import { AiController } from '../controllers/ai.controller';
import { InvoiceModule } from '../../application/invoices/invoice.module';
import { InvoiceController } from '../controllers/invoice.controller';
import { TaskModule } from '../../application/tasks/task.module';
import { TaskController } from '../controllers/task.controller';
import { AzureDevOpsModule } from '../../infrastructure/azure-devops/azure-devops.module';
import { AzureDevOpsAuthController } from '../controllers/azure-devops-auth.controller';
import { WebhookController } from '../controllers/webhook.controller';
import { AzureDevOpsSyncService } from '../../application/tasks/sync/azure-devops-sync.service';

@Module({
    imports: [
        SentryModule.forRoot(),
        ConfigModule.forRoot({ isGlobal: true }),
        PersistenceModule,
        AuthModule,
        TenantModule,
        UserModule,
        RolesModule,
        SecretsModule,
        LlmModule,
        InvoiceModule,
        TaskModule,
        AzureDevOpsModule,
    ],
    controllers: [
        RolesController,
        TenantController,
        UserController,
        SecretsController,
        AiController,
        InvoiceController,
        TaskController,
        AzureDevOpsAuthController,
        WebhookController,
    ],
    providers: [Logger, AzureDevOpsSyncService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(TenantMiddleware).forRoutes('*');
    }
}
