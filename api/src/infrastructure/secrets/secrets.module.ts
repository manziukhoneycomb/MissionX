import { Module, Provider, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SECRET_STORAGE } from '../../domain/secrets/secret-storage.interface';
import { LocalSecretStorage } from './storage/local-secret-storage';
import { AwsSecretManagerSecretStorage } from './storage/aws-secret-manager-secret-storage';
import { AzureKeyVaultSecretStorage } from './storage/azure-key-vault-secret-storage';

const secretStorageProvider: Provider = {
    provide: SECRET_STORAGE,
    useFactory: (configService: ConfigService) => {
        const providerType: string | undefined =
            configService.get<string>('SECRET_STORAGE_PROVIDER');

        const nodeEnv: string | undefined = configService.get<string>('NODE_ENV');
        const isDevelopment: boolean = nodeEnv === 'development';

        switch (providerType?.toLowerCase()) {
            case 'azure':
                return new AzureKeyVaultSecretStorage(configService);
            case 'aws':
                return new AwsSecretManagerSecretStorage(configService);
            default:
                if (isDevelopment) {
                    return new LocalSecretStorage();
                } else {
                    throw new Error(
                        'Invalid configuration: Secret storage provider must be configured for non-development environments.',
                    );
                }
        }
    },
    inject: [ConfigService],
};

@Global()
@Module({
    imports: [ConfigModule],
    providers: [secretStorageProvider],
    exports: [SECRET_STORAGE],
})
export class SecretsInfrastructureModule {}
