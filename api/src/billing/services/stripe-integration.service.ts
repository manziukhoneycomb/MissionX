import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { BillingService } from '../billing.service';
import { BillingRepository } from '../repositories/billing.repository';
import { SubscriptionRepository } from '../repositories/subscription.repository';
import { CreateSubscriptionDto, SubscriptionDto, SubscriptionStatus } from '../dto/subscription.dto';
import { AddPaymentMethodDto, PaymentMethodDto, PaymentMethodType } from '../dto/payment-method.dto';
import { InvoiceDto, InvoiceStatus } from '../dto/invoice.dto';
import { BillingDetailsDto, UpdateBillingDetailsDto } from '../dto/billing-details.dto';
import { extractErrorInfo } from '../../domain/utils/error.utils';
import Stripe from 'stripe';

@Injectable()
export class StripeIntegrationService {
    private readonly logger = new Logger(StripeIntegrationService.name);

    constructor(
        private readonly billingService: BillingService,
        private readonly billingRepository: BillingRepository,
        private readonly subscriptionRepository: SubscriptionRepository,
    ) {}

    async createCustomerForTenant(tenantId: string, email: string, name?: string): Promise<BillingDetailsDto> {
        try {
            // Check if billing details already exist for this tenant
            const existingBillingDetails = await this.billingRepository.findBillingDetailsByTenantId(tenantId);
            if (existingBillingDetails) {
                throw new BadRequestException('Billing details already exist for this tenant');
            }

            // Create Stripe customer
            const stripeCustomer = await this.billingService.createCustomer(email, name);

            // Save billing details to database
            const billingDetails = await this.billingRepository.createBillingDetails({
                tenantId,
                stripeCustomerId: stripeCustomer.id,
                billingEmail: email,
                companyName: name,
            });

            return this.mapBillingDetailsToDto(billingDetails);
        } catch (error) {
            const { message } = extractErrorInfo(error, 'Failed to create customer');
            this.logger.error(`Failed to create customer for tenant ${tenantId}: ${message}`);
            throw new InternalServerErrorException('Failed to create billing customer');
        }
    }

    async createSubscription(dto: CreateSubscriptionDto): Promise<SubscriptionDto> {
        try {
            // Get or create billing details
            let billingDetails = await this.billingRepository.findBillingDetailsByTenantId(dto.tenantId);
            if (!billingDetails) {
                billingDetails = await this.billingRepository.createBillingDetails({
                    tenantId: dto.tenantId,
                    stripeCustomerId: '', // Will be updated after customer creation
                    billingEmail: dto.customerEmail,
                });

                const stripeCustomer = await this.billingService.createCustomer(dto.customerEmail);
                billingDetails = await this.billingRepository.updateBillingDetails(billingDetails.id, {
                    stripeCustomerId: stripeCustomer.id,
                });
            }

            if (!billingDetails) {
                throw new InternalServerErrorException('Failed to create billing details');
            }

            // Create Stripe subscription
            const stripeSubscription = await this.billingService.createSubscription(
                billingDetails.stripeCustomerId,
                dto.stripePriceId,
                dto.trialPeriodDays
            );

            // Save subscription to database
            const subscription = await this.subscriptionRepository.create({
                stripeSubscriptionId: stripeSubscription.id,
                tenantId: dto.tenantId,
                stripeCustomerId: billingDetails.stripeCustomerId,
                stripePriceId: dto.stripePriceId,
                status: this.mapStripeSubscriptionStatus(stripeSubscription.status),
                currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
                currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
                trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : undefined,
            });

            return this.mapSubscriptionToDto(subscription);
        } catch (error) {
            const { message } = extractErrorInfo(error, 'Failed to create subscription');
            this.logger.error(`Failed to create subscription for tenant ${dto.tenantId}: ${message}`);
            throw new InternalServerErrorException('Failed to create subscription');
        }
    }

    async updateSubscription(subscriptionId: string, stripePriceId: string, prorationBehavior?: 'none' | 'create_prorations' | 'always_invoice'): Promise<SubscriptionDto> {
        try {
            const subscription = await this.subscriptionRepository.findById(subscriptionId);
            if (!subscription) {
                throw new BadRequestException('Subscription not found');
            }

            // Update Stripe subscription
            const stripeSubscription = await this.billingService.updateSubscription(subscription.stripeSubscriptionId, {
                items: [{
                    id: (await this.billingService.getSubscription(subscription.stripeSubscriptionId)).items.data[0].id,
                    price: stripePriceId,
                }],
                proration_behavior: prorationBehavior || 'create_prorations',
            });

            // Update local subscription
            const updatedSubscription = await this.subscriptionRepository.update(subscriptionId, {
                stripePriceId,
                status: this.mapStripeSubscriptionStatus(stripeSubscription.status),
                currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
                currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
            });

            if (!updatedSubscription) {
                throw new InternalServerErrorException('Failed to update subscription');
            }

            return this.mapSubscriptionToDto(updatedSubscription);
        } catch (error) {
            const { message } = extractErrorInfo(error, 'Failed to update subscription');
            this.logger.error(`Failed to update subscription ${subscriptionId}: ${message}`);
            throw new InternalServerErrorException('Failed to update subscription');
        }
    }

    async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<SubscriptionDto> {
        try {
            const subscription = await this.subscriptionRepository.findById(subscriptionId);
            if (!subscription) {
                throw new BadRequestException('Subscription not found');
            }

            // Cancel Stripe subscription
            const stripeSubscription = await this.billingService.cancelSubscription(subscription.stripeSubscriptionId, cancelAtPeriodEnd);

            // Update local subscription
            const updatedSubscription = await this.subscriptionRepository.update(subscriptionId, {
                status: this.mapStripeSubscriptionStatus(stripeSubscription.status),
                canceledAt: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000) : new Date(),
            });

            if (!updatedSubscription) {
                throw new InternalServerErrorException('Failed to cancel subscription');
            }

            return this.mapSubscriptionToDto(updatedSubscription);
        } catch (error) {
            const { message } = extractErrorInfo(error, 'Failed to cancel subscription');
            this.logger.error(`Failed to cancel subscription ${subscriptionId}: ${message}`);
            throw new InternalServerErrorException('Failed to cancel subscription');
        }
    }

    async addPaymentMethod(dto: AddPaymentMethodDto): Promise<PaymentMethodDto> {
        try {
            const billingDetails = await this.billingRepository.findBillingDetailsByTenantId(dto.tenantId);
            if (!billingDetails) {
                throw new BadRequestException('Billing details not found for tenant');
            }

            // Attach payment method to customer
            const stripePaymentMethod = await this.billingService.attachPaymentMethod(
                dto.stripePaymentMethodId,
                billingDetails.stripeCustomerId
            );

            // If this should be the default payment method, update customer
            if (dto.setAsDefault) {
                await this.billingService.setDefaultPaymentMethod(
                    billingDetails.stripeCustomerId,
                    dto.stripePaymentMethodId
                );

                // Unset other default payment methods for this tenant
                await this.billingRepository.updatePaymentMethod(
                    '', // Will be handled in the repository method
                    { isDefault: false }
                );
            }

            // Save payment method to database
            const paymentMethod = await this.billingRepository.createPaymentMethod({
                stripePaymentMethodId: stripePaymentMethod.id,
                tenantId: dto.tenantId,
                stripeCustomerId: billingDetails.stripeCustomerId,
                type: this.mapStripePaymentMethodType(stripePaymentMethod.type),
                isDefault: dto.setAsDefault || false,
                cardBrand: stripePaymentMethod.card?.brand,
                cardLast4: stripePaymentMethod.card?.last4,
                cardExpMonth: stripePaymentMethod.card?.exp_month,
                cardExpYear: stripePaymentMethod.card?.exp_year,
                cardCountry: stripePaymentMethod.card?.country || undefined,
            });

            return this.mapPaymentMethodToDto(paymentMethod);
        } catch (error) {
            const { message } = extractErrorInfo(error, 'Failed to add payment method');
            this.logger.error(`Failed to add payment method for tenant ${dto.tenantId}: ${message}`);
            throw new InternalServerErrorException('Failed to add payment method');
        }
    }

    async removePaymentMethod(paymentMethodId: string): Promise<void> {
        try {
            const paymentMethod = await this.billingRepository.findPaymentMethodById(paymentMethodId);
            if (!paymentMethod) {
                throw new BadRequestException('Payment method not found');
            }

            // Detach from Stripe
            await this.billingService.detachPaymentMethod(paymentMethod.stripePaymentMethodId);

            // Remove from database
            await this.billingRepository.deletePaymentMethod(paymentMethodId);
        } catch (error) {
            const { message } = extractErrorInfo(error, 'Failed to remove payment method');
            this.logger.error(`Failed to remove payment method ${paymentMethodId}: ${message}`);
            throw new InternalServerErrorException('Failed to remove payment method');
        }
    }

    async updateBillingDetails(tenantId: string, dto: UpdateBillingDetailsDto): Promise<BillingDetailsDto> {
        try {
            const billingDetails = await this.billingRepository.findBillingDetailsByTenantId(tenantId);
            if (!billingDetails) {
                throw new BadRequestException('Billing details not found');
            }

            // Update Stripe customer if email changed
            if (dto.billingEmail && dto.billingEmail !== billingDetails.billingEmail) {
                await this.billingService.updateCustomer(billingDetails.stripeCustomerId, {
                    email: dto.billingEmail,
                    name: dto.companyName,
                    address: {
                        line1: dto.addressLine1,
                        line2: dto.addressLine2,
                        city: dto.city,
                        state: dto.state,
                        postal_code: dto.postalCode,
                        country: dto.country,
                    },
                });
            }

            // Update local billing details
            const updatedBillingDetails = await this.billingRepository.updateBillingDetails(billingDetails.id, dto);
            if (!updatedBillingDetails) {
                throw new InternalServerErrorException('Failed to update billing details');
            }

            return this.mapBillingDetailsToDto(updatedBillingDetails);
        } catch (error) {
            const { message } = extractErrorInfo(error, 'Failed to update billing details');
            this.logger.error(`Failed to update billing details for tenant ${tenantId}: ${message}`);
            throw new InternalServerErrorException('Failed to update billing details');
        }
    }

    // Mapping methods
    private mapStripeSubscriptionStatus(stripeStatus: string): SubscriptionStatus {
        switch (stripeStatus) {
            case 'active':
                return SubscriptionStatus.ACTIVE;
            case 'canceled':
                return SubscriptionStatus.CANCELED;
            case 'incomplete':
                return SubscriptionStatus.INCOMPLETE;
            case 'incomplete_expired':
                return SubscriptionStatus.INCOMPLETE_EXPIRED;
            case 'past_due':
                return SubscriptionStatus.PAST_DUE;
            case 'trialing':
                return SubscriptionStatus.TRIALING;
            case 'unpaid':
                return SubscriptionStatus.UNPAID;
            default:
                return SubscriptionStatus.INCOMPLETE;
        }
    }

    private mapStripePaymentMethodType(stripeType: string): PaymentMethodType {
        switch (stripeType) {
            case 'card':
                return PaymentMethodType.CARD;
            case 'us_bank_account':
                return PaymentMethodType.BANK_ACCOUNT;
            case 'sepa_debit':
                return PaymentMethodType.SEPA_DEBIT;
            default:
                return PaymentMethodType.CARD;
        }
    }

    private mapSubscriptionToDto(subscription: any): SubscriptionDto {
        const dto = new SubscriptionDto();
        dto.id = subscription.id;
        dto.stripeSubscriptionId = subscription.stripeSubscriptionId;
        dto.tenantId = subscription.tenantId;
        dto.stripeCustomerId = subscription.stripeCustomerId;
        dto.stripePriceId = subscription.stripePriceId;
        dto.status = subscription.status;
        dto.currentPeriodStart = subscription.currentPeriodStart;
        dto.currentPeriodEnd = subscription.currentPeriodEnd;
        dto.trialEnd = subscription.trialEnd;
        dto.canceledAt = subscription.canceledAt;
        dto.createdAt = subscription.createdAt;
        dto.updatedAt = subscription.updatedAt;
        return dto;
    }

    private mapPaymentMethodToDto(paymentMethod: any): PaymentMethodDto {
        const dto = new PaymentMethodDto();
        dto.id = paymentMethod.id;
        dto.stripePaymentMethodId = paymentMethod.stripePaymentMethodId;
        dto.tenantId = paymentMethod.tenantId;
        dto.stripeCustomerId = paymentMethod.stripeCustomerId;
        dto.type = paymentMethod.type;
        dto.isDefault = paymentMethod.isDefault;
        dto.createdAt = paymentMethod.createdAt;

        if (paymentMethod.type === PaymentMethodType.CARD && paymentMethod.cardBrand) {
            dto.card = {
                brand: paymentMethod.cardBrand,
                last4: paymentMethod.cardLast4,
                expMonth: paymentMethod.cardExpMonth,
                expYear: paymentMethod.cardExpYear,
                country: paymentMethod.cardCountry,
            };
        }

        return dto;
    }

    private mapBillingDetailsToDto(billingDetails: any): BillingDetailsDto {
        const dto = new BillingDetailsDto();
        dto.tenantId = billingDetails.tenantId;
        dto.stripeCustomerId = billingDetails.stripeCustomerId;
        dto.billingEmail = billingDetails.billingEmail;
        dto.companyName = billingDetails.companyName;
        dto.taxId = billingDetails.taxId;
        dto.addressLine1 = billingDetails.addressLine1;
        dto.addressLine2 = billingDetails.addressLine2;
        dto.city = billingDetails.city;
        dto.state = billingDetails.state;
        dto.postalCode = billingDetails.postalCode;
        dto.country = billingDetails.country;
        dto.createdAt = billingDetails.createdAt;
        dto.updatedAt = billingDetails.updatedAt;
        return dto;
    }
}