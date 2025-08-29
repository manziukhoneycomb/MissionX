import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ISecretStorage } from '../../../domain/secrets/secret-storage.interface';
import {
    SecretsManagerClient,
    GetSecretValueCommand,
    CreateSecretCommand,
    UpdateSecretCommand,
    ResourceNotFoundException,
} from '@aws-sdk/client-secrets-manager';

@Injectable()
export class AwsSecretManagerSecretStorage implements ISecretStorage {
    private readonly client: SecretsManagerClient;

    constructor(private configService: ConfigService) {
        this.client = new SecretsManagerClient({
            region: this.configService.get('AWS_REGION'),
        });
    }

    async getSingle(keyName: string): Promise<string | null> {
        const command = new GetSecretValueCommand({ SecretId: keyName });

        try {
            const response = await this.client.send(command);

            return response.SecretString ?? null;
        } catch (error) {
            if (error instanceof ResourceNotFoundException) {
                return null;
            }

            throw error;
        }
    }

    async getMultiple(keyNames: string[]): Promise<Record<string, string | null>> {
        const results: Record<string, string | null> = {};
        const promises = keyNames.map((keyName) => this.getSingle(keyName));

        const settledResults = await Promise.allSettled(promises);

        settledResults.forEach((result, index) => {
            const keyName = keyNames[index];
            if (result.status === 'fulfilled') {
                results[keyName] = result.value;
            } else {
                results[keyName] = null;
            }
        });

        return results;
    }

    async set(keyName: string, value: string): Promise<void> {
        try {
            const updateCommand = new UpdateSecretCommand({
                SecretId: keyName,
                SecretString: value,
            });

            await this.client.send(updateCommand);
        } catch (updateError) {
            if (updateError instanceof ResourceNotFoundException) {
                const createCommand = new CreateSecretCommand({
                    Name: keyName,
                    SecretString: value,
                });

                await this.client.send(createCommand);
            }

            throw updateError;
        }
    }
}
