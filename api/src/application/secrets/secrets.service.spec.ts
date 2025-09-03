/* eslint-disable @typescript-eslint/unbound-method */
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

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getSecret', () => {
        it('should retrieve a secret and return SecretDto', async () => {
            const tenantId = 'tenant-123';
            const key = SecretKey.STRIPE;
            const expectedValue = 'sk_test_stripe_key';
            const expectedSecretName = 'tenant--tenant-123--Stripe';

            mockSecretStorage.getSingle.mockResolvedValue(expectedValue);

            const result = await service.getSecret(tenantId, key);

            expect(mockSecretStorage.getSingle).toHaveBeenCalledWith(expectedSecretName);
            expect(result).toEqual({ key, value: expectedValue });
        });

        it('should handle null secret values', async () => {
            const tenantId = 'tenant-123';
            const key = SecretKey.OPEN_AI;
            const expectedSecretName = 'tenant--tenant-123--OpenAI';

            mockSecretStorage.getSingle.mockResolvedValue(null);

            const result = await service.getSecret(tenantId, key);

            expect(mockSecretStorage.getSingle).toHaveBeenCalledWith(expectedSecretName);
            expect(result).toEqual({ key, value: null });
        });
    });

    describe('getAllSecrets', () => {
        it('should retrieve all secrets and return array of SecretDto', async () => {
            const tenantId = 'tenant-456';
            const mockSecretsRecord = {
                'tenant--tenant-456--Stripe': 'sk_test_stripe_value',
                'tenant--tenant-456--OpenAI': 'sk-openai-value',
            };

            mockSecretStorage.getMultiple.mockResolvedValue(mockSecretsRecord);

            const result = await service.getAllSecrets(tenantId);

            expect(mockSecretStorage.getMultiple).toHaveBeenCalledWith([
                'tenant--tenant-456--Stripe',
                'tenant--tenant-456--OpenAI',
            ]);
            expect(result).toHaveLength(2);
            expect(result).toContainEqual({ key: SecretKey.STRIPE, value: 'sk_test_stripe_value' });
            expect(result).toContainEqual({ key: SecretKey.OPEN_AI, value: 'sk-openai-value' });
        });

        it('should return empty values when no secrets are found', async () => {
            const tenantId = 'tenant-empty';
            const mockSecretsRecord = {};

            mockSecretStorage.getMultiple.mockResolvedValue(mockSecretsRecord);

            const result = await service.getAllSecrets(tenantId);

            expect(mockSecretStorage.getMultiple).toHaveBeenCalledWith([
                'tenant--tenant-empty--Stripe',
                'tenant--tenant-empty--OpenAI',
            ]);
            expect(result).toHaveLength(2);
            expect(result).toContainEqual({ key: SecretKey.STRIPE, value: null });
            expect(result).toContainEqual({ key: SecretKey.OPEN_AI, value: null });
        });
    });

    describe('setSecret', () => {
        it('should set a secret by delegating to storage', async () => {
            const tenantId = 'tenant-789';
            const secretDto: SecretDto = {
                key: SecretKey.STRIPE,
                value: 'sk_live_new_stripe_key',
            };
            const expectedSecretName = 'tenant--tenant-789--Stripe';

            mockSecretStorage.set.mockResolvedValue();

            await service.setSecret(tenantId, secretDto);

            expect(mockSecretStorage.set).toHaveBeenCalledWith(
                expectedSecretName,
                'sk_live_new_stripe_key',
            );
        });

        it('should handle setting null secret values', async () => {
            const tenantId = 'tenant-789';
            const secretDto: SecretDto = {
                key: SecretKey.OPEN_AI,
                value: null,
            };
            const expectedSecretName = 'tenant--tenant-789--OpenAI';

            mockSecretStorage.set.mockResolvedValue();

            await service.setSecret(tenantId, secretDto);

            expect(mockSecretStorage.set).toHaveBeenCalledWith(expectedSecretName, null);
        });
    });

    describe('error handling', () => {
        it('should propagate errors from secret storage', async () => {
            const tenantId = 'tenant-error';
            const key = SecretKey.STRIPE;
            const storageError = new Error('Storage connection failed');

            mockSecretStorage.getSingle.mockRejectedValue(storageError);

            await expect(service.getSecret(tenantId, key)).rejects.toThrow(
                'Storage connection failed',
            );
        });
    });
});
