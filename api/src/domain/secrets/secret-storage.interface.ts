export interface ISecretStorage {
    getSingle(keyName: string): Promise<string | null>;
    getMultiple(keyNames: string[]): Promise<Record<string, string | null>>;
    set(keyName: string, value: string | null): Promise<void>;
}

export const SECRET_STORAGE: string = 'SECRET_STORAGE';
