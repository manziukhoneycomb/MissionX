import { Inject, Injectable } from '@nestjs/common';
import { ISecretStorage, SECRET_STORAGE } from '../../domain/secrets/secret-storage.interface';
import { SecretKey } from '../../domain/enums/secret-key.enum';
import { SecretDto } from './dto/secret.dto';
import { ISecretService } from './interfaces/secrets.service.interface';

@Injectable()
export class SecretService implements ISecretService {
    constructor(@Inject(SECRET_STORAGE) private readonly secretStorage: ISecretStorage) {}

    private constructSecretName(tenantId: string, key: SecretKey): string {
        const safeKey: string = key.replace(/[^a-zA-Z0-9-]/g, '-');

        return `tenant--${tenantId}--${safeKey}`;
    }

    async getSecret(tenantId: string, key: SecretKey): Promise<SecretDto> {
        const secretName: string = this.constructSecretName(tenantId, key);
        const value: string | null = await this.secretStorage.getSingle(secretName);

        return { key, value };
    }

    async getAllSecrets(tenantId: string): Promise<SecretDto[]> {
        const allKeys: SecretKey[] = Object.values(SecretKey);
        const secretNames: string[] = allKeys.map((key) => this.constructSecretName(tenantId, key));

        const secretsRecord: Record<string, string | null> =
            await this.secretStorage.getMultiple(secretNames);

        return allKeys.map((key) => {
            const secretName = this.constructSecretName(tenantId, key);
            const value = secretsRecord[secretName] ?? null;

            return { key, value };
        });
    }

    async setSecret(tenantId: string, secretDto: SecretDto): Promise<void> {
        const { key, value }: SecretDto = secretDto;
        const secretName: string = this.constructSecretName(tenantId, key);

        await this.secretStorage.set(secretName, value);
    }
}
