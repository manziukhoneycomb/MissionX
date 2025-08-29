import { Injectable, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';
import { ISecretStorage } from '../../../domain/secrets/secret-storage.interface';
import { RestError } from '@azure/core-rest-pipeline';

@Injectable()
export class AzureKeyVaultSecretStorage implements ISecretStorage {
    private readonly client: SecretClient;

    constructor(private configService: ConfigService) {
        const keyVaultUrl = this.configService.get<string>('AZURE_KEY_VAULT_URL');

        if (!keyVaultUrl) {
            throw new Error('AZURE_KEY_VAULT_URL is not configured');
        }

        const credential = new DefaultAzureCredential();
        this.client = new SecretClient(keyVaultUrl, credential);
    }

    async getSingle(keyName: string): Promise<string | null> {
        try {
            const secret = await this.client.getSecret(keyName);

            return secret?.value ?? null;
        } catch (error) {
            if (error instanceof RestError && error.statusCode === HttpStatus.NOT_FOUND) {
                return null;
            }

            throw error;
        }
    }

    async getMultiple(keyNames: string[]): Promise<Record<string, string | null>> {
        const results: Record<string, string | null> = {};
        const promises = keyNames.map(async (keyName) => {
            results[keyName] = await this.getSingle(keyName);
        });

        await Promise.all(promises);

        return results;
    }

    async set(keyName: string, value: string): Promise<void> {
        await this.client.setSecret(keyName, value);
    }
}
