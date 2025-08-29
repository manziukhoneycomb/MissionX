import { Module } from '@nestjs/common';
import { SecretService } from './secrets.service';
import { SecretsInfrastructureModule } from '../../infrastructure/secrets/secrets.module';
import { SECRET_SERVICE } from './interfaces/secrets.service.interface';

@Module({
    imports: [SecretsInfrastructureModule],
    providers: [
        {
            provide: SECRET_SERVICE,
            useClass: SecretService,
        },
    ],
    exports: [SECRET_SERVICE],
})
export class SecretsModule {}
