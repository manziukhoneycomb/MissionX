import { SecretKey } from '../../../domain/enums/secret-key.enum';
import { SecretDto } from '../dto/secret.dto';

export const SECRET_SERVICE: unique symbol = Symbol('SECRET_SERVICE');

export interface ISecretService {
    getSecret(tenantId: string, key: SecretKey): Promise<SecretDto>;
    getAllSecrets(tenantId: string): Promise<SecretDto[]>;
    setSecret(tenantId: string, secretDto: SecretDto): Promise<void>;
}
