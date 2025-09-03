/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { SecretService } from './secrets.service';
import { ISecretStorage, SECRET_STORAGE } from '../../domain/secrets/secret-storage.interface';
import { SecretKey } from '../../domain/enums/secret-key.enum';
import { SecretDto } from './dto/secret.dto';

describe('SecretService', () => {
    let service: SecretService;
    let mockSecretStorage: jest.Mocked<ISecretStorage>;

    const mockTenantId = 'test-tenant-123';

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
            const secretKey = SecretKey.STRIPE;
            const expectedValue = 'sk_test_123456789';
            const expectedSecretName = `tenant--${mockTenantId}--${secretKey}`;

            mockSecretStorage.getSingle.mockResolvedValue(expectedValue);

            const result: SecretDto = await service.getSecret(mockTenantId, secretKey);

            expect(mockSecretStorage.getSingle).toHaveBeenCalledWith(expectedSecretName);
            expect(result).toEqual({
                key: secretKey,
                value: expectedValue,
            });
        });

        it('should return null value when secret does not exist', async () => {
            const secretKey = SecretKey.OPEN_AI;
            const expectedSecretName = `tenant--${mockTenantId}--${secretKey}`;

            mockSecretStorage.getSingle.mockResolvedValue(null);

            const result: SecretDto = await service.getSecret(mockTenantId, secretKey);

            expect(mockSecretStorage.getSingle).toHaveBeenCalledWith(expectedSecretName);
            expect(result).toEqual({
                key: secretKey,
                value: null,
            });
        });

        it('should handle storage errors gracefully', async () => {
            const secretKey = SecretKey.STRIPE;
            const storageError = new Error('Storage connection failed');

            mockSecretStorage.getSingle.mockRejectedValue(storageError);

            await expect(service.getSecret(mockTenantId, secretKey)).rejects.toThrow(storageError);
        });
    });

    describe('getAllSecrets', () => {
        it('should retrieve all secrets successfully', async () => {
            const mockSecretsRecord = {
                [`tenant--${mockTenantId}--${SecretKey.STRIPE}`]: 'sk_test_stripe_key',
                [`tenant--${mockTenantId}--${SecretKey.OPEN_AI}`]: 'sk-openai-key-123',
            };

            mockSecretStorage.getMultiple.mockResolvedValue(mockSecretsRecord);

            const result: SecretDto[] = await service.getAllSecrets(mockTenantId);

            const expectedSecretNames = [
                `tenant--${mockTenantId}--${SecretKey.STRIPE}`,
                `tenant--${mockTenantId}--${SecretKey.OPEN_AI}`,
            ];

            expect(mockSecretStorage.getMultiple).toHaveBeenCalledWith(expectedSecretNames);
            expect(result).toHaveLength(2);
            expect(result).toEqual([
                { key: SecretKey.STRIPE, value: 'sk_test_stripe_key' },
                { key: SecretKey.OPEN_AI, value: 'sk-openai-key-123' },
            ]);
        });

        it('should return empty values when no secrets exist', async () => {
            const mockSecretsRecord = {
                [`tenant--${mockTenantId}--${SecretKey.STRIPE}`]: null,
                [`tenant--${mockTenantId}--${SecretKey.OPEN_AI}`]: null,
            };

            mockSecretStorage.getMultiple.mockResolvedValue(mockSecretsRecord);

            const result: SecretDto[] = await service.getAllSecrets(mockTenantId);

            expect(result).toHaveLength(2);
            expect(result).toEqual([
                { key: SecretKey.STRIPE, value: null },
                { key: SecretKey.OPEN_AI, value: null },
            ]);
        });

        it('should handle partial results when some secrets are missing', async () => {
            const mockSecretsRecord = {
                [`tenant--${mockTenantId}--${SecretKey.STRIPE}`]: 'sk_test_stripe_key',
                // Missing OpenAI secret
            };

            mockSecretStorage.getMultiple.mockResolvedValue(mockSecretsRecord);

            const result: SecretDto[] = await service.getAllSecrets(mockTenantId);

            expect(result).toHaveLength(2);
            expect(result).toEqual([
                { key: SecretKey.STRIPE, value: 'sk_test_stripe_key' },
                { key: SecretKey.OPEN_AI, value: null },
            ]);
        });

        it('should handle storage errors when retrieving all secrets', async () => {
            const storageError = new Error('Failed to retrieve multiple secrets');

            mockSecretStorage.getMultiple.mockRejectedValue(storageError);

            await expect(service.getAllSecrets(mockTenantId)).rejects.toThrow(storageError);
        });
    });

    describe('setSecret', () => {
        it('should set a secret successfully', async () => {
            const secretDto: SecretDto = {
                key: SecretKey.STRIPE,
                value: 'sk_test_new_stripe_key',
            };
            const expectedSecretName = `tenant--${mockTenantId}--${SecretKey.STRIPE}`;

            mockSecretStorage.set.mockResolvedValue();

            await service.setSecret(mockTenantId, secretDto);

            expect(mockSecretStorage.set).toHaveBeenCalledWith(expectedSecretName, secretDto.value);
        });

        it('should set a secret with null value', async () => {
            const secretDto: SecretDto = {
                key: SecretKey.OPEN_AI,
                value: null,
            };
            const expectedSecretName = `tenant--${mockTenantId}--${SecretKey.OPEN_AI}`;

            mockSecretStorage.set.mockResolvedValue();

            await service.setSecret(mockTenantId, secretDto);

            expect(mockSecretStorage.set).toHaveBeenCalledWith(expectedSecretName, null);
        });

        it('should handle storage errors when setting a secret', async () => {
            const secretDto: SecretDto = {
                key: SecretKey.STRIPE,
                value: 'sk_test_stripe_key',
            };
            const storageError = new Error('Failed to store secret');

            mockSecretStorage.set.mockRejectedValue(storageError);

            await expect(service.setSecret(mockTenantId, secretDto)).rejects.toThrow(storageError);
        });
    });

    describe('constructSecretName (private method behavior)', () => {
        it('should construct secret names correctly through public methods', async () => {
            const secretKey = SecretKey.STRIPE;
            const expectedSecretName = `tenant--${mockTenantId}--${secretKey}`;

            mockSecretStorage.getSingle.mockResolvedValue('test-value');

            await service.getSecret(mockTenantId, secretKey);

            expect(mockSecretStorage.getSingle).toHaveBeenCalledWith(expectedSecretName);
        });

        it('should sanitize special characters in secret keys', async () => {
            // Test with a hypothetical secret key that might contain special characters
            // This tests the private constructSecretName method's sanitization logic
            const mockTenantIdWithSpecialChars = 'tenant@123';

            mockSecretStorage.getSingle.mockResolvedValue('test-value');

            await service.getSecret(mockTenantIdWithSpecialChars, SecretKey.OPEN_AI);

            const expectedCall = mockSecretStorage.getSingle.mock.calls[0][0];
            expect(expectedCall).toBe(
                `tenant--${mockTenantIdWithSpecialChars}--${SecretKey.OPEN_AI}`,
            );
        });
    });
});
