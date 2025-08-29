import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ISecretStorage } from '../../../domain/secrets/secret-storage.interface';

@Injectable()
export class LocalSecretStorage implements ISecretStorage, OnModuleInit {
    private readonly storageBasePath: string = path.resolve(
        process.cwd(),
        '.containers',
        'secrets',
    );

    async onModuleInit(): Promise<void> {
        await fs.mkdir(this.storageBasePath, { recursive: true });
    }

    private getSecretPath(keyName: string): string {
        const safeFileName = keyName.replace(/[./\\:*?"<>|]/g, '_') + '.secret';

        return path.join(this.storageBasePath, safeFileName);
    }

    async getSingle(keyName: string): Promise<string | null> {
        const filePath: string = this.getSecretPath(keyName);

        const data: Buffer = await fs.readFile(filePath);
        return data.toString('utf-8');
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
        const filePath: string = this.getSecretPath(keyName);

        await fs.writeFile(filePath, value, 'utf-8');
    }
}
