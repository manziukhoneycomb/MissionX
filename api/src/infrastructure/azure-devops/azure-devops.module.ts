import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../../domain/entities/task.entity';
import { OAuthModule } from './auth/oauth.module';
import { AzureDevOpsApiClient } from './api/client.service';
import { WebhookValidatorService } from './webhook/webhook-validator.service';

@Module({
    imports: [
        OAuthModule,
        TypeOrmModule.forFeature([Task]),
    ],
    providers: [
        AzureDevOpsApiClient,
        WebhookValidatorService,
    ],
    exports: [
        OAuthModule,
        AzureDevOpsApiClient,
        WebhookValidatorService,
    ],
})
export class AzureDevOpsModule {}