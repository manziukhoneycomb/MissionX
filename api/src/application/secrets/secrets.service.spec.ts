import { Test, TestingModule } from '@nestjs/testing';
import { SecretService } from './secrets.service';
import { ISecretStorage, SECRET_STORAGE } from '../../domain/secrets/secret-storage.interface';
import { SecretKey } from '../../domain/enums/secret-key.enum';
import { SecretDto } from './dto/secret.dto';

describe('SecretService', () => {
    let service: SecretService;
    let mockSecretStorage: jest.Mocked<ISecretStorage>;

    beforeEach(async () => {
        mockSecretStorage = {
            getSingle: jest.fn(),
            getMultiple: jest.fn(),
            set: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SecretService,
                {
                    provide: SECRET_STORAGE,
                    useValue: mockSecretStorage,
                },
            ],
        }).compile();

        service = module.get<SecretService>(SecretService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getSecret', () => {
        it('should retrieve a secret successfully', async () => {
            const tenantId = 'tenant-123';
            const key = SecretKey.STRIPE;
            const expectedValue = 'sk_test_123456789';
            const expectedSecretName = 'tenant--tenant-123--Stripe';

            mockSecretStorage.getSingle.mockResolvedValue(expectedValue);

            const result = await service.getSecret(tenantId, key);

            expect(mockSecretStorage.getSingle).toHaveBeenCalledWith(expectedSecretName);
            expect(result).toEqual({ key, value: expectedValue });
        });

        it('should handle non-existent secret (null value)', async () => {
            const tenantId = 'tenant-123';
            const key = SecretKey.OPEN_AI;
            const expectedSecretName = 'tenant--tenant-123--OpenAI';

            mockSecretStorage.getSingle.mockResolvedValue(null);

            const result = await service.getSecret(tenantId, key);

            expect(mockSecretStorage.getSingle).toHaveBeenCalledWith(expectedSecretName);
            expect(result).toEqual({ key, value: null });
        });

        it('should handle special characters in tenant ID', async () => {
            const tenantId = 'tenant@123-special';
            const key = SecretKey.STRIPE;
            const expectedSecretName = 'tenant--tenant@123-special--Stripe';

            mockSecretStorage.getSingle.mockResolvedValue('test-value');

            await service.getSecret(tenantId, key);

            expect(mockSecretStorage.getSingle).toHaveBeenCalledWith(expectedSecretName);
        });
    });

    describe('getAllSecrets', () => {
        it('should retrieve all secrets for a tenant', async () => {
            const tenantId = 'tenant-456';
            const mockSecretsRecord = {
                'tenant--tenant-456--Stripe': 'stripe_secret_value',
                'tenant--tenant-456--OpenAI': 'openai_secret_value',
            };

            mockSecretStorage.getMultiple.mockResolvedValue(mockSecretsRecord);

            const result = await service.getAllSecrets(tenantId);

            const expectedSecretNames = [
                'tenant--tenant-456--Stripe',
                'tenant--tenant-456--OpenAI',
            ];

            expect(mockSecretStorage.getMultiple).toHaveBeenCalledWith(expectedSecretNames);
            expect(result).toHaveLength(Object.values(SecretKey).length);
            expect(result).toEqual([
                { key: SecretKey.STRIPE, value: 'stripe_secret_value' },
                { key: SecretKey.OPEN_AI, value: 'openai_secret_value' },
            ]);
        });

        it('should handle missing secrets with null values', async () => {
            const tenantId = 'tenant-789';
            const mockSecretsRecord = {
                'tenant--tenant-789--Stripe': null,
                'tenant--tenant-789--OpenAI': 'openai_value',
            };

            mockSecretStorage.getMultiple.mockResolvedValue(mockSecretsRecord);

            const result = await service.getAllSecrets(tenantId);

            expect(result).toEqual([
                { key: SecretKey.STRIPE, value: null },
                { key: SecretKey.OPEN_AI, value: 'openai_value' },
            ]);
        });

        it('should handle completely empty results', async () => {
            const tenantId = 'empty-tenant';
            const mockSecretsRecord = {
                'tenant--empty-tenant--Stripe': null,
                'tenant--empty-tenant--OpenAI': null,
            };

            mockSecretStorage.getMultiple.mockResolvedValue(mockSecretsRecord);

            const result = await service.getAllSecrets(tenantId);

            expect(result).toEqual([
                { key: SecretKey.STRIPE, value: null },
                { key: SecretKey.OPEN_AI, value: null },
            ]);
        });
    });

    describe('setSecret', () => {
        it('should set a secret successfully', async () => {
            const tenantId = 'tenant-set';
            const secretDto: SecretDto = {
                key: SecretKey.STRIPE,
                value: 'new_stripe_secret',
            };
            const expectedSecretName = 'tenant--tenant-set--Stripe';

            mockSecretStorage.set.mockResolvedValue();

            await service.setSecret(tenantId, secretDto);

            expect(mockSecretStorage.set).toHaveBeenCalledWith(
                expectedSecretName,
                'new_stripe_secret',
            );
        });

        it('should set a secret with null value', async () => {
            const tenantId = 'tenant-null';
            const secretDto: SecretDto = {
                key: SecretKey.OPEN_AI,
                value: null,
            };
            const expectedSecretName = 'tenant--tenant-null--OpenAI';

            mockSecretStorage.set.mockResolvedValue();

            await service.setSecret(tenantId, secretDto);

            expect(mockSecretStorage.set).toHaveBeenCalledWith(expectedSecretName, null);
        });
    });

    describe('error handling', () => {
        it('should propagate storage errors when getting a secret', async () => {
            const tenantId = 'error-tenant';
            const key = SecretKey.STRIPE;
            const storageError = new Error('Storage connection failed');

            mockSecretStorage.getSingle.mockRejectedValue(storageError);

            await expect(service.getSecret(tenantId, key)).rejects.toThrow(
                'Storage connection failed',
            );
        });

        it('should propagate storage errors when getting all secrets', async () => {
            const tenantId = 'error-tenant';
            const storageError = new Error('Network timeout');

            mockSecretStorage.getMultiple.mockRejectedValue(storageError);

            await expect(service.getAllSecrets(tenantId)).rejects.toThrow('Network timeout');
        });

        it('should propagate storage errors when setting a secret', async () => {
            const tenantId = 'error-tenant';
            const secretDto: SecretDto = {
                key: SecretKey.STRIPE,
                value: 'test_value',
            };
            const storageError = new Error('Write permission denied');

            mockSecretStorage.set.mockRejectedValue(storageError);

            await expect(service.setSecret(tenantId, secretDto)).rejects.toThrow(
                'Write permission denied',
            );
        });
    });

    describe('constructSecretName (private method behavior)', () => {
        it('should sanitize keys with special characters', async () => {
            const tenantId = 'tenant-test';
            const key = SecretKey.STRIPE;

            mockSecretStorage.getSingle.mockResolvedValue('test-value');

            await service.getSecret(tenantId, key);

            expect(mockSecretStorage.getSingle).toHaveBeenCalledWith('tenant--tenant-test--Stripe');
        });
    });
});
