import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { OAuthService } from './oauth.service';
import { OAUTH_SERVICE } from './interfaces/oauth.service.interface';
import { AzureDevOpsToken } from '../../../domain/entities/azure-devops-token.entity';
import { SecretsModule } from '../../../application/secrets/secrets.module';
import { TokenInterceptor } from './token.interceptor';
import { OAuthGuard } from './oauth.guard';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([AzureDevOpsToken]),
        SecretsModule,
    ],
    providers: [
        {
            provide: OAUTH_SERVICE,
            useClass: OAuthService,
        },
        TokenInterceptor,
        OAuthGuard,
    ],
    exports: [OAUTH_SERVICE, TokenInterceptor, OAuthGuard],
})
export class OAuthModule {}