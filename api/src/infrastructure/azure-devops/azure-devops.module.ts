import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AzureDevOpsOAuthService } from './auth/azure-devops-oauth.service';
import { AzureDevOpsApiService } from './api/azure-devops-api.service';
import { SecretsModule } from '../secrets/secrets.module';

@Module({
    imports: [ConfigModule, SecretsModule],
    providers: [AzureDevOpsOAuthService, AzureDevOpsApiService],
    exports: [AzureDevOpsOAuthService, AzureDevOpsApiService],
})
export class AzureDevOpsModule {}