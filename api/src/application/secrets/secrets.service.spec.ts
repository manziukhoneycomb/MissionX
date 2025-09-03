import { Test, TestingModule } from '@nestjs/testing';
import { SecretService } from './secrets.service';
import { ISecretStorage, SECRET_STORAGE } from '../../domain/secrets/secret-storage.interface';
import { SecretKey } from '../../domain/enums/secret-key.enum';
import { SecretDto } from './dto/secret.dto';

describe('SecretService', () => {
    let service: SecretService;
    let mockSecretStorage: jest.Mocked<ISecretStorage>;

    beforeEach(async () => {
        const mockStorage: jest.Mocked<ISecretStorage> = {
            getSingle: jest.fn(),
            getMultiple: jest.fn(),
            set: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SecretService,
                {
                    provide: SECRET_STORAGE,
                    useValue: mockStorage,
                },
            ],
        }).compile();

        service = module.get<SecretService>(SecretService);
        mockSecretStorage = module.get(SECRET_STORAGE);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getSecret', () => {
        it('should retrieve a secret and return SecretDto', async () => {
            // Arrange
            const tenantId = 'tenant-123';
            const key = SecretKey.STRIPE;
            const expectedSecretName = 'tenant--tenant-123--Stripe';
            const expectedValue = 'sk_test_123456789';

            mockSecretStorage.getSingle.mockResolvedValue(expectedValue);

            // Act
            const result: SecretDto = await service.getSecret(tenantId, key);

            // Assert
            expect(mockSecretStorage.getSingle).toHaveBeenCalledWith(expectedSecretName);
            expect(mockSecretStorage.getSingle).toHaveBeenCalledTimes(1);
            expect(result).toEqual({ key, value: expectedValue });
        });

        it('should handle null values when secret not found', async () => {
            // Arrange
            const tenantId = 'tenant-456';
            const key = SecretKey.OPEN_AI;
            const expectedSecretName = 'tenant--tenant-456--OpenAI';

            mockSecretStorage.getSingle.mockResolvedValue(null);

            // Act
            const result: SecretDto = await service.getSecret(tenantId, key);

            // Assert
            expect(mockSecretStorage.getSingle).toHaveBeenCalledWith(expectedSecretName);
            expect(result).toEqual({ key, value: null });
        });
    });

    describe('getAllSecrets', () => {
        it('should list all secrets for a tenant', async () => {
            // Arrange
            const tenantId = 'tenant-789';
            const expectedSecretNames = [
                'tenant--tenant-789--Stripe',
                'tenant--tenant-789--OpenAI'
            ];
            const mockSecretsRecord = {
                'tenant--tenant-789--Stripe': 'stripe_secret_value',
                'tenant--tenant-789--OpenAI': 'openai_secret_value'
            };

            mockSecretStorage.getMultiple.mockResolvedValue(mockSecretsRecord);

            // Act
            const result: SecretDto[] = await service.getAllSecrets(tenantId);

            // Assert
            expect(mockSecretStorage.getMultiple).toHaveBeenCalledWith(expectedSecretNames);
            expect(mockSecretStorage.getMultiple).toHaveBeenCalledTimes(1);
            expect(result).toHaveLength(2);
            expect(result).toEqual([
                { key: SecretKey.STRIPE, value: 'stripe_secret_value' },
                { key: SecretKey.OPEN_AI, value: 'openai_secret_value' }
            ]);
        });

        it('should handle empty results when no secrets exist', async () => {
            // Arrange
            const tenantId = 'empty-tenant';
            const expectedSecretNames = [
                'tenant--empty-tenant--Stripe',
                'tenant--empty-tenant--OpenAI'
            ];
            const mockEmptyRecord = {
                'tenant--empty-tenant--Stripe': null,
                'tenant--empty-tenant--OpenAI': null
            };

            mockSecretStorage.getMultiple.mockResolvedValue(mockEmptyRecord);

            // Act
            const result: SecretDto[] = await service.getAllSecrets(tenantId);

            // Assert
            expect(mockSecretStorage.getMultiple).toHaveBeenCalledWith(expectedSecretNames);
            expect(result).toHaveLength(2);
            expect(result).toEqual([
                { key: SecretKey.STRIPE, value: null },
                { key: SecretKey.OPEN_AI, value: null }
            ]);
        });
    });

    describe('setSecret', () => {
        it('should set a secret by delegating to storage', async () => {
            // Arrange
            const tenantId = 'tenant-set';
            const secretDto: SecretDto = {
                key: SecretKey.STRIPE,
                value: 'new_stripe_secret'
            };
            const expectedSecretName = 'tenant--tenant-set--Stripe';

            mockSecretStorage.set.mockResolvedValue();

            // Act
            await service.setSecret(tenantId, secretDto);

            // Assert
            expect(mockSecretStorage.set).toHaveBeenCalledWith(expectedSecretName, 'new_stripe_secret');
            expect(mockSecretStorage.set).toHaveBeenCalledTimes(1);
        });
    });

    describe('error handling', () => {
        it('should propagate errors from storage layer', async () => {
            // Arrange
            const tenantId = 'error-tenant';
            const key = SecretKey.STRIPE;
            const storageError = new Error('Storage connection failed');

            mockSecretStorage.getSingle.mockRejectedValue(storageError);

            // Act & Assert
            await expect(service.getSecret(tenantId, key)).rejects.toThrow('Storage connection failed');
            expect(mockSecretStorage.getSingle).toHaveBeenCalledTimes(1);
        });
    });
});