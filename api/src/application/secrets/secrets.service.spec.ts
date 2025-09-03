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

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getSecret', () => {
        it('should retrieve a secret successfully', async () => {
            const tenantId = 'tenant-123';
            const key = SecretKey.STRIPE;
            const expectedValue = 'sk_test_stripe_key';
            const expectedSecretName = 'tenant--tenant-123--Stripe';

            mockSecretStorage.getSingle.mockResolvedValue(expectedValue);

            const result: SecretDto = await service.getSecret(tenantId, key);

            expect(mockSecretStorage.getSingle).toHaveBeenCalledWith(expectedSecretName);
            expect(result).toEqual({ key, value: expectedValue });
        });

        it('should handle null values when secret does not exist', async () => {
            const tenantId = 'tenant-123';
            const key = SecretKey.OPEN_AI;
            const expectedSecretName = 'tenant--tenant-123--OpenAI';

            mockSecretStorage.getSingle.mockResolvedValue(null);

            const result: SecretDto = await service.getSecret(tenantId, key);

            expect(mockSecretStorage.getSingle).toHaveBeenCalledWith(expectedSecretName);
            expect(result).toEqual({ key, value: null });
        });

        it('should handle errors from secret storage', async () => {
            const tenantId = 'tenant-123';
            const key = SecretKey.STRIPE;
            const error = new Error('Storage connection failed');

            mockSecretStorage.getSingle.mockRejectedValue(error);

            await expect(service.getSecret(tenantId, key)).rejects.toThrow(
                'Storage connection failed',
            );
        });
    });

    describe('getAllSecrets', () => {
        it('should retrieve all secrets successfully', async () => {
            const tenantId = 'tenant-456';
            const mockSecretRecord = {
                'tenant--tenant-456--Stripe': 'sk_test_stripe_value',
                'tenant--tenant-456--OpenAI': 'sk-openai-key-123',
            };

            mockSecretStorage.getMultiple.mockResolvedValue(mockSecretRecord);

            const result: SecretDto[] = await service.getAllSecrets(tenantId);

            expect(mockSecretStorage.getMultiple).toHaveBeenCalledWith([
                'tenant--tenant-456--Stripe',
                'tenant--tenant-456--OpenAI',
            ]);
            expect(result).toEqual([
                { key: SecretKey.STRIPE, value: 'sk_test_stripe_value' },
                { key: SecretKey.OPEN_AI, value: 'sk-openai-key-123' },
            ]);
        });

        it('should handle empty results when no secrets exist', async () => {
            const tenantId = 'tenant-empty';
            const mockSecretRecord = {
                'tenant--tenant-empty--Stripe': null,
                'tenant--tenant-empty--OpenAI': null,
            };

            mockSecretStorage.getMultiple.mockResolvedValue(mockSecretRecord);

            const result: SecretDto[] = await service.getAllSecrets(tenantId);

            expect(result).toEqual([
                { key: SecretKey.STRIPE, value: null },
                { key: SecretKey.OPEN_AI, value: null },
            ]);
        });

        it('should handle partial results when some secrets exist', async () => {
            const tenantId = 'tenant-partial';
            const mockSecretRecord = {
                'tenant--tenant-partial--Stripe': 'sk_test_stripe_value',
            };

            mockSecretStorage.getMultiple.mockResolvedValue(mockSecretRecord);

            const result: SecretDto[] = await service.getAllSecrets(tenantId);

            expect(result).toEqual([
                { key: SecretKey.STRIPE, value: 'sk_test_stripe_value' },
                { key: SecretKey.OPEN_AI, value: null },
            ]);
        });
    });

    describe('setSecret', () => {
        it('should set a secret successfully', async () => {
            const tenantId = 'tenant-789';
            const secretDto: SecretDto = {
                key: SecretKey.STRIPE,
                value: 'sk_test_new_stripe_key',
            };
            const expectedSecretName = 'tenant--tenant-789--Stripe';

            mockSecretStorage.set.mockResolvedValue();

            await service.setSecret(tenantId, secretDto);

            expect(mockSecretStorage.set).toHaveBeenCalledWith(
                expectedSecretName,
                'sk_test_new_stripe_key',
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

        it('should handle errors during secret setting', async () => {
            const tenantId = 'tenant-error';
            const secretDto: SecretDto = {
                key: SecretKey.STRIPE,
                value: 'sk_test_value',
            };
            const error = new Error('Permission denied');

            mockSecretStorage.set.mockRejectedValue(error);

            await expect(service.setSecret(tenantId, secretDto)).rejects.toThrow(
                'Permission denied',
            );
        });
    });

    describe('constructSecretName', () => {
        it('should construct secret names with special characters replaced', () => {
            const testService = new SecretService(mockSecretStorage);
            const tenantId = 'tenant-123';

            const stripeResult = (
                testService as unknown as {
                    constructSecretName: (tenantId: string, key: SecretKey) => string;
                }
            ).constructSecretName(tenantId, SecretKey.STRIPE);
            expect(stripeResult).toBe('tenant--tenant-123--Stripe');

            const openAiResult = (
                testService as unknown as {
                    constructSecretName: (tenantId: string, key: SecretKey) => string;
                }
            ).constructSecretName(tenantId, SecretKey.OPEN_AI);
            expect(openAiResult).toBe('tenant--tenant-123--OpenAI');
        });
    });
});
