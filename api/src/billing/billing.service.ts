import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class BillingService {
    private readonly logger = new Logger(BillingService.name);
    private readonly stripe: Stripe;

    constructor(private readonly configService: ConfigService) {
        const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        
        if (!stripeSecretKey) {
            this.logger.warn('STRIPE_SECRET_KEY not configured. Billing functionality will be limited.');
            // Initialize with dummy key for development/testing
            this.stripe = new Stripe('sk_test_dummy', {
                apiVersion: '2025-11-17.clover',
            });
        } else {
            this.stripe = new Stripe(stripeSecretKey, {
                apiVersion: '2025-11-17.clover',
            });
        }

        this.logger.log('Stripe SDK initialized');
    }

    getStripeInstance(): Stripe {
        return this.stripe;
    }

    async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
        try {
            const customer = await this.stripe.customers.create({
                email,
                name,
            });

            this.logger.log(`Created Stripe customer ${customer.id} for email: ${email}`);
            return customer;
        } catch (error) {
            this.logger.error(`Failed to create Stripe customer for email: ${email}`, error);
            throw error;
        }
    }

    async getCustomer(customerId: string): Promise<Stripe.Customer> {
        try {
            const customer = await this.stripe.customers.retrieve(customerId);
            
            if (customer.deleted) {
                throw new Error(`Customer ${customerId} has been deleted`);
            }

            return customer as Stripe.Customer;
        } catch (error) {
            this.logger.error(`Failed to retrieve Stripe customer: ${customerId}`, error);
            throw error;
        }
    }

    async updateCustomer(customerId: string, params: Stripe.CustomerUpdateParams): Promise<Stripe.Customer> {
        try {
            const customer = await this.stripe.customers.update(customerId, params);
            this.logger.log(`Updated Stripe customer: ${customerId}`);
            return customer;
        } catch (error) {
            this.logger.error(`Failed to update Stripe customer: ${customerId}`, error);
            throw error;
        }
    }

    async deleteCustomer(customerId: string): Promise<Stripe.DeletedCustomer> {
        try {
            const deletedCustomer = await this.stripe.customers.del(customerId);
            this.logger.log(`Deleted Stripe customer: ${customerId}`);
            return deletedCustomer;
        } catch (error) {
            this.logger.error(`Failed to delete Stripe customer: ${customerId}`, error);
            throw error;
        }
    }

    async createSubscription(customerId: string, priceId: string, trialPeriodDays?: number): Promise<Stripe.Subscription> {
        try {
            const subscriptionParams: Stripe.SubscriptionCreateParams = {
                customer: customerId,
                items: [{ price: priceId }],
                payment_behavior: 'default_incomplete',
                payment_settings: { save_default_payment_method: 'on_subscription' },
                expand: ['latest_invoice.payment_intent'],
            };

            if (trialPeriodDays && trialPeriodDays > 0) {
                subscriptionParams.trial_period_days = trialPeriodDays;
            }

            const subscription = await this.stripe.subscriptions.create(subscriptionParams);
            
            this.logger.log(`Created Stripe subscription ${subscription.id} for customer: ${customerId}`);
            return subscription;
        } catch (error) {
            this.logger.error(`Failed to create subscription for customer: ${customerId}`, error);
            throw error;
        }
    }

    async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
        try {
            const subscription = await this.stripe.subscriptions.retrieve(subscriptionId, {
                expand: ['default_payment_method', 'items.data.price']
            });
            
            return subscription;
        } catch (error) {
            this.logger.error(`Failed to retrieve subscription: ${subscriptionId}`, error);
            throw error;
        }
    }

    async updateSubscription(subscriptionId: string, params: Stripe.SubscriptionUpdateParams): Promise<Stripe.Subscription> {
        try {
            const subscription = await this.stripe.subscriptions.update(subscriptionId, params);
            this.logger.log(`Updated Stripe subscription: ${subscriptionId}`);
            return subscription;
        } catch (error) {
            this.logger.error(`Failed to update subscription: ${subscriptionId}`, error);
            throw error;
        }
    }

    async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<Stripe.Subscription> {
        try {
            const subscription = await this.stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: cancelAtPeriodEnd,
            });
            
            this.logger.log(`${cancelAtPeriodEnd ? 'Scheduled cancellation for' : 'Immediately canceled'} subscription: ${subscriptionId}`);
            return subscription;
        } catch (error) {
            this.logger.error(`Failed to cancel subscription: ${subscriptionId}`, error);
            throw error;
        }
    }

    async attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<Stripe.PaymentMethod> {
        try {
            const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
                customer: customerId,
            });

            this.logger.log(`Attached payment method ${paymentMethodId} to customer: ${customerId}`);
            return paymentMethod;
        } catch (error) {
            this.logger.error(`Failed to attach payment method ${paymentMethodId} to customer: ${customerId}`, error);
            throw error;
        }
    }

    async detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
        try {
            const paymentMethod = await this.stripe.paymentMethods.detach(paymentMethodId);
            this.logger.log(`Detached payment method: ${paymentMethodId}`);
            return paymentMethod;
        } catch (error) {
            this.logger.error(`Failed to detach payment method: ${paymentMethodId}`, error);
            throw error;
        }
    }

    async listPaymentMethods(customerId: string, type: string = 'card'): Promise<Stripe.PaymentMethod[]> {
        try {
            const paymentMethods = await this.stripe.paymentMethods.list({
                customer: customerId,
                type: type as Stripe.PaymentMethodListParams.Type,
            });

            return paymentMethods.data;
        } catch (error) {
            this.logger.error(`Failed to list payment methods for customer: ${customerId}`, error);
            throw error;
        }
    }

    async setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<Stripe.Customer> {
        try {
            const customer = await this.stripe.customers.update(customerId, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });

            this.logger.log(`Set default payment method ${paymentMethodId} for customer: ${customerId}`);
            return customer;
        } catch (error) {
            this.logger.error(`Failed to set default payment method for customer: ${customerId}`, error);
            throw error;
        }
    }

    async getInvoice(invoiceId: string): Promise<Stripe.Invoice> {
        try {
            const invoice = await this.stripe.invoices.retrieve(invoiceId, {
                expand: ['payment_intent', 'subscription']
            });
            
            return invoice;
        } catch (error) {
            this.logger.error(`Failed to retrieve invoice: ${invoiceId}`, error);
            throw error;
        }
    }

    async listInvoices(customerId: string, limit: number = 10): Promise<Stripe.Invoice[]> {
        try {
            const invoices = await this.stripe.invoices.list({
                customer: customerId,
                limit,
                expand: ['data.payment_intent', 'data.subscription'],
            });

            return invoices.data;
        } catch (error) {
            this.logger.error(`Failed to list invoices for customer: ${customerId}`, error);
            throw error;
        }
    }

    async createInvoice(customerId: string, params?: Stripe.InvoiceCreateParams): Promise<Stripe.Invoice> {
        try {
            const invoiceParams: Stripe.InvoiceCreateParams = {
                customer: customerId,
                ...params,
            };

            const invoice = await this.stripe.invoices.create(invoiceParams);
            this.logger.log(`Created Stripe invoice ${invoice.id} for customer: ${customerId}`);
            return invoice;
        } catch (error) {
            this.logger.error(`Failed to create invoice for customer: ${customerId}`, error);
            throw error;
        }
    }

    async finalizeInvoice(invoiceId: string): Promise<Stripe.Invoice> {
        try {
            const invoice = await this.stripe.invoices.finalizeInvoice(invoiceId);
            this.logger.log(`Finalized invoice: ${invoiceId}`);
            return invoice;
        } catch (error) {
            this.logger.error(`Failed to finalize invoice: ${invoiceId}`, error);
            throw error;
        }
    }

    async payInvoice(invoiceId: string): Promise<Stripe.Invoice> {
        try {
            const invoice = await this.stripe.invoices.pay(invoiceId);
            this.logger.log(`Paid invoice: ${invoiceId}`);
            return invoice;
        } catch (error) {
            this.logger.error(`Failed to pay invoice: ${invoiceId}`, error);
            throw error;
        }
    }

    constructEvent(body: string | Buffer, signature: string): Stripe.Event {
        const endpointSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
        
        if (!endpointSecret) {
            throw new Error('Stripe webhook secret not configured');
        }

        try {
            return this.stripe.webhooks.constructEvent(body, signature, endpointSecret);
        } catch (error) {
            this.logger.error('Failed to construct Stripe webhook event', error);
            throw error;
        }
    }
}