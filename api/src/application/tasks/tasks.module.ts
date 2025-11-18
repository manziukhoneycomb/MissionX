import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../../domain/entities/task.entity';
import { TaskService } from './task.service';
import { TaskRepository } from '../../infrastructure/persistence/repositories/task.repository';
import { TaskController } from '../../api/controllers/task.controller';
import { TASK_SERVICE } from './interfaces/task.service.interface';
import { TASK_REPOSITORY } from '../repositories/task.repository.interface';
import { AzureDevOpsModule } from '../../infrastructure/azure-devops/azure-devops.module';
import { SyncConfigurationService } from './sync/sync.config';
import { SyncConflictResolver } from './sync/sync-conflict.resolver';
import { SyncQueueService } from './sync/sync-queue.service';
import { SyncService } from './sync/sync.service';
import { SyncSchedulerService } from './sync/sync-scheduler.service';
import { WebhookController } from '../../api/controllers/webhook.controller';
import { WebhookAuthMiddleware } from '../../api/middleware/webhook-auth.middleware';

@Module({
    imports: [
        TypeOrmModule.forFeature([Task]),
        AzureDevOpsModule,
    ],
    controllers: [
        TaskController,
        WebhookController,
    ],
    providers: [
        {
            provide: TASK_SERVICE,
            useClass: TaskService,
        },
        {
            provide: TASK_REPOSITORY,
            useClass: TaskRepository,
        },
        SyncConfigurationService,
        SyncConflictResolver,
        SyncQueueService,
        SyncService,
        SyncSchedulerService,
        WebhookAuthMiddleware,
    ],
    exports: [
        TASK_SERVICE,
        SyncService,
        SyncSchedulerService,
        SyncConfigurationService,
        SyncConflictResolver,
        SyncQueueService,
    ],
})
export class TasksModule {}