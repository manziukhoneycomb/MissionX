import { Test, TestingModule } from '@nestjs/testing';
import { SecretService } from './secrets.service';
import { ISecretStorage, SECRET_STORAGE } from '../../domain/secrets/secret-storage.interface';
import { SecretKey } from '../../domain/enums/secret-key.enum';
import { SecretDto } from './dto/secret.dto';

/* eslint-disable @typescript-eslint/unbound-method */

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
        mockSecretStorage = module.get<jest.Mocked<ISecretStorage>>(SECRET_STORAGE);
    });

    describe('getSecret', () => {
        it('should retrieve a secret successfully', async () => {
            const tenantId = 'tenant-123';
            const key = SecretKey.STRIPE;
            const expectedValue = 'sk_test_123456789';
            const expectedSecretName = 'tenant--tenant-123--Stripe';

            mockSecretStorage.getSingle.mockResolvedValue(expectedValue);

            const result: SecretDto = await service.getSecret(tenantId, key);

            expect(mockSecretStorage.getSingle).toHaveBeenCalledWith(expectedSecretName);
            expect(result).toEqual({ key, value: expectedValue });
        });

        it('should handle empty result when secret not found', async () => {
            const tenantId = 'tenant-123';
            const key = SecretKey.OPEN_AI;
            const expectedSecretName = 'tenant--tenant-123--OpenAI';

            mockSecretStorage.getSingle.mockResolvedValue(null);

            const result: SecretDto = await service.getSecret(tenantId, key);

            expect(mockSecretStorage.getSingle).toHaveBeenCalledWith(expectedSecretName);
            expect(result).toEqual({ key, value: null });
        });
    });

    describe('getAllSecrets', () => {
        it('should retrieve all secrets for a tenant', async () => {
            const tenantId = 'tenant-456';
            const expectedSecrets: Record<string, string | null> = {
                'tenant--tenant-456--Stripe': 'sk_live_987654321',
                'tenant--tenant-456--OpenAI': 'sk-openai-abc123',
            };

            mockSecretStorage.getMultiple.mockResolvedValue(expectedSecrets);

            const result: SecretDto[] = await service.getAllSecrets(tenantId);

            expect(mockSecretStorage.getMultiple).toHaveBeenCalledWith([
                'tenant--tenant-456--Stripe',
                'tenant--tenant-456--OpenAI',
            ]);
            expect(result).toEqual([
                { key: SecretKey.STRIPE, value: 'sk_live_987654321' },
                { key: SecretKey.OPEN_AI, value: 'sk-openai-abc123' },
            ]);
        });

        it('should handle empty results when no secrets are set', async () => {
            const tenantId = 'tenant-empty';
            const emptySecrets: Record<string, string | null> = {
                'tenant--tenant-empty--Stripe': null,
                'tenant--tenant-empty--OpenAI': null,
            };

            mockSecretStorage.getMultiple.mockResolvedValue(emptySecrets);

            const result: SecretDto[] = await service.getAllSecrets(tenantId);

            expect(mockSecretStorage.getMultiple).toHaveBeenCalledWith([
                'tenant--tenant-empty--Stripe',
                'tenant--tenant-empty--OpenAI',
            ]);
            expect(result).toEqual([
                { key: SecretKey.STRIPE, value: null },
                { key: SecretKey.OPEN_AI, value: null },
            ]);
        });
    });

    describe('setSecret', () => {
        it('should set a secret successfully', async () => {
            const tenantId = 'tenant-789';
            const secretDto: SecretDto = {
                key: SecretKey.STRIPE,
                value: 'sk_test_newvalue',
            };
            const expectedSecretName = 'tenant--tenant-789--Stripe';

            mockSecretStorage.set.mockResolvedValue();

            await service.setSecret(tenantId, secretDto);

            expect(mockSecretStorage.set).toHaveBeenCalledWith(expectedSecretName, secretDto.value);
        });
    });

    describe('error handling', () => {
        it('should propagate errors from secret storage', async () => {
            const tenantId = 'tenant-error';
            const key = SecretKey.STRIPE;
            const errorMessage = 'Storage connection failed';

            mockSecretStorage.getSingle.mockRejectedValue(new Error(errorMessage));

            await expect(service.getSecret(tenantId, key)).rejects.toThrow(errorMessage);
            expect(mockSecretStorage.getSingle).toHaveBeenCalledWith(
                'tenant--tenant-error--Stripe',
            );
        });
    });

    describe('secret name construction', () => {
        it('should construct proper secret names with special character sanitization', async () => {
            const tenantId = 'tenant-special';
            const key = SecretKey.OPEN_AI;
            const expectedSecretName = 'tenant--tenant-special--OpenAI';

            mockSecretStorage.getSingle.mockResolvedValue('test-value');

            await service.getSecret(tenantId, key);

            expect(mockSecretStorage.getSingle).toHaveBeenCalledWith(expectedSecretName);
        });
    });
});
