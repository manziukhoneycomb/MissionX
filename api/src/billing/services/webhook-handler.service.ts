import { Injectable, Logger } from '@nestjs/common';
import { BillingService } from '../billing.service';
import { BillingRepository } from '../repositories/billing.repository';
import { SubscriptionRepository } from '../repositories/subscription.repository';
import { SubscriptionStatus } from '../dto/subscription.dto';
import { InvoiceStatus } from '../dto/invoice.dto';
import { extractErrorInfo } from '../../domain/utils/error.utils';
import Stripe from 'stripe';

@Injectable()
export class WebhookHandlerService {
    private readonly logger = new Logger(WebhookHandlerService.name);

    constructor(
        private readonly billingService: BillingService,
        private readonly billingRepository: BillingRepository,
        private readonly subscriptionRepository: SubscriptionRepository,
    ) {}

    async handleWebhookEvent(event: Stripe.Event): Promise<void> {
        this.logger.log(`Processing Stripe webhook event: ${event.type} (${event.id})`);

        try {
            switch (event.type) {
                case 'customer.subscription.created':
                    await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
                    break;

                case 'customer.subscription.updated':
                    await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
                    break;

                case 'customer.subscription.deleted':
                    await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                    break;

                case 'invoice.created':
                    await this.handleInvoiceCreated(event.data.object as Stripe.Invoice);
                    break;

                case 'invoice.finalized':
                    await this.handleInvoiceFinalized(event.data.object as Stripe.Invoice);
                    break;

                case 'invoice.paid':
                    await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
                    break;

                case 'invoice.payment_failed':
                    await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
                    break;

                case 'payment_method.attached':
                    await this.handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
                    break;

                case 'payment_method.detached':
                    await this.handlePaymentMethodDetached(event.data.object as Stripe.PaymentMethod);
                    break;

                case 'customer.created':
                    await this.handleCustomerCreated(event.data.object as Stripe.Customer);
                    break;

                case 'customer.updated':
                    await this.handleCustomerUpdated(event.data.object as Stripe.Customer);
                    break;

                case 'customer.deleted':
                    await this.handleCustomerDeleted(event.data.object as Stripe.Customer);
                    break;

                default:
                    this.logger.debug(`Unhandled webhook event type: ${event.type}`);
                    break;
            }

            this.logger.log(`Successfully processed webhook event: ${event.type} (${event.id})`);
        } catch (error) {
            const { message, stack } = extractErrorInfo(error, 'Unknown webhook processing error');
            this.logger.error(`Failed to process webhook event ${event.type} (${event.id}): ${message}`, stack);
            throw error;
        }
    }

    private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
        try {
            // Find existing subscription by Stripe ID
            const existingSubscription = await this.subscriptionRepository.findByStripeId(subscription.id);
            if (existingSubscription) {
                this.logger.debug(`Subscription ${subscription.id} already exists, updating...`);
                await this.updateSubscriptionFromStripe(subscription);
                return;
            }

            // Find billing details by customer ID
            const billingDetails = await this.billingRepository.findBillingDetailsByStripeCustomerId(subscription.customer as string);
            if (!billingDetails) {
                this.logger.error(`No billing details found for customer ${subscription.customer}`);
                return;
            }

            // Create new subscription
            await this.subscriptionRepository.create({
                stripeSubscriptionId: subscription.id,
                tenantId: billingDetails.tenantId,
                stripeCustomerId: subscription.customer as string,
                stripePriceId: subscription.items.data[0]?.price?.id || '',
                status: this.mapStripeSubscriptionStatus(subscription.status),
                currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
                currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
            });

            this.logger.log(`Created subscription ${subscription.id} for tenant ${billingDetails.tenantId}`);
        } catch (error) {
            const { message } = extractErrorInfo(error, 'Failed to handle subscription created');
            this.logger.error(`Failed to handle subscription.created for ${subscription.id}: ${message}`);
            throw error;
        }
    }

    private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
        await this.updateSubscriptionFromStripe(subscription);
    }

    private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
        try {
            const localSubscription = await this.subscriptionRepository.findByStripeId(subscription.id);
            if (!localSubscription) {
                this.logger.debug(`Subscription ${subscription.id} not found locally`);
                return;
            }

            await this.subscriptionRepository.update(localSubscription.id, {
                status: SubscriptionStatus.CANCELED,
                canceledAt: new Date(subscription.canceled_at! * 1000),
            });

            this.logger.log(`Marked subscription ${subscription.id} as canceled`);
        } catch (error) {
            const { message } = extractErrorInfo(error, 'Failed to handle subscription deleted');
            this.logger.error(`Failed to handle subscription.deleted for ${subscription.id}: ${message}`);
            throw error;
        }
    }

    private async handleInvoiceCreated(invoice: Stripe.Invoice): Promise<void> {
        try {
            // Check if invoice already exists
            const existingInvoice = await this.billingRepository.findInvoiceByStripeId(invoice.id);
            if (existingInvoice) {
                this.logger.debug(`Invoice ${invoice.id} already exists`);
                return;
            }

            // Find billing details by customer ID
            const billingDetails = await this.billingRepository.findBillingDetailsByStripeCustomerId(invoice.customer as string);
            if (!billingDetails) {
                this.logger.error(`No billing details found for customer ${invoice.customer}`);
                return;
            }

            // Create invoice
            const createdInvoice = await this.billingRepository.createInvoice({
                stripeInvoiceId: invoice.id,
                tenantId: billingDetails.tenantId,
                stripeCustomerId: invoice.customer as string,
                stripeSubscriptionId: (invoice as any).subscription as string || undefined,
                number: invoice.number || '',
                status: this.mapStripeInvoiceStatus(invoice.status!),
                amountDue: invoice.amount_due,
                amountPaid: invoice.amount_paid,
                subtotal: invoice.subtotal,
                tax: (invoice as any).tax || 0,
                total: invoice.total,
                currency: invoice.currency,
                invoicePdf: (invoice as any).invoice_pdf || undefined,
                hostedInvoiceUrl: (invoice as any).hosted_invoice_url || undefined,
                finalizedAt: invoice.status_transitions?.finalized_at ? new Date(invoice.status_transitions.finalized_at * 1000) : undefined,
                paidAt: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000) : undefined,
                dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : undefined,
            });

            // Create line items
            if (invoice.lines && invoice.lines.data.length > 0) {
                const lineItems = invoice.lines.data.map(line => ({
                    invoiceId: createdInvoice.id,
                    stripeLineItemId: line.id,
                    description: line.description || '',
                    amount: line.amount,
                    currency: line.currency,
                    quantity: line.quantity || 1,
                    unitAmount: (line as any).unit_amount || line.amount,
                    periodStart: line.period?.start ? new Date(line.period.start * 1000) : undefined,
                    periodEnd: line.period?.end ? new Date(line.period.end * 1000) : undefined,
                }));

                await this.billingRepository.createMultipleInvoiceLineItems(lineItems);
            }

            this.logger.log(`Created invoice ${invoice.id} for tenant ${billingDetails.tenantId}`);
        } catch (error) {
            const { message } = extractErrorInfo(error, 'Failed to handle invoice created');
            this.logger.error(`Failed to handle invoice.created for ${invoice.id}: ${message}`);
            throw error;
        }
    }

    private async handleInvoiceFinalized(invoice: Stripe.Invoice): Promise<void> {
        await this.updateInvoiceFromStripe(invoice);
    }

    private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
        await this.updateInvoiceFromStripe(invoice);

        // If this is a subscription invoice, ensure subscription is active
        if ((invoice as any).subscription) {
            const subscription = await this.subscriptionRepository.findByStripeId((invoice as any).subscription as string);
            if (subscription && subscription.status !== SubscriptionStatus.ACTIVE) {
                await this.subscriptionRepository.update(subscription.id, {
                    status: SubscriptionStatus.ACTIVE,
                });
                this.logger.log(`Reactivated subscription ${subscription.id} after successful payment`);
            }
        }
    }

    private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
        await this.updateInvoiceFromStripe(invoice);

        // If this is a subscription invoice, mark subscription as past due
        if ((invoice as any).subscription) {
            const subscription = await this.subscriptionRepository.findByStripeId((invoice as any).subscription as string);
            if (subscription) {
                await this.subscriptionRepository.update(subscription.id, {
                    status: SubscriptionStatus.PAST_DUE,
                });
                this.logger.log(`Marked subscription ${subscription.id} as past due after payment failure`);
            }
        }
    }

    private async handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod): Promise<void> {
        // This is usually handled in the application flow, but we can log for monitoring
        this.logger.log(`Payment method ${paymentMethod.id} attached to customer ${paymentMethod.customer}`);
    }

    private async handlePaymentMethodDetached(paymentMethod: Stripe.PaymentMethod): Promise<void> {
        try {
            // Remove payment method from local database
            const localPaymentMethod = await this.billingRepository.findPaymentMethodByStripeId(paymentMethod.id);
            if (localPaymentMethod) {
                await this.billingRepository.deletePaymentMethod(localPaymentMethod.id);
                this.logger.log(`Removed payment method ${paymentMethod.id} from database`);
            }
        } catch (error) {
            const { message } = extractErrorInfo(error, 'Failed to handle payment method detached');
            this.logger.error(`Failed to handle payment_method.detached for ${paymentMethod.id}: ${message}`);
            throw error;
        }
    }

    private async handleCustomerCreated(customer: Stripe.Customer): Promise<void> {
        this.logger.log(`Customer ${customer.id} created in Stripe`);
    }

    private async handleCustomerUpdated(customer: Stripe.Customer): Promise<void> {
        try {
            const billingDetails = await this.billingRepository.findBillingDetailsByStripeCustomerId(customer.id);
            if (billingDetails && customer.email !== billingDetails.billingEmail) {
                await this.billingRepository.updateBillingDetails(billingDetails.id, {
                    billingEmail: customer.email || billingDetails.billingEmail,
                    companyName: customer.name || billingDetails.companyName,
                });
                this.logger.log(`Updated billing details for customer ${customer.id}`);
            }
        } catch (error) {
            const { message } = extractErrorInfo(error, 'Failed to handle customer updated');
            this.logger.error(`Failed to handle customer.updated for ${customer.id}: ${message}`);
            throw error;
        }
    }

    private async handleCustomerDeleted(customer: Stripe.Customer): Promise<void> {
        try {
            const billingDetails = await this.billingRepository.findBillingDetailsByStripeCustomerId(customer.id);
            if (billingDetails) {
                await this.billingRepository.deleteBillingDetails(billingDetails.id);
                this.logger.log(`Deleted billing details for customer ${customer.id}`);
            }
        } catch (error) {
            const { message } = extractErrorInfo(error, 'Failed to handle customer deleted');
            this.logger.error(`Failed to handle customer.deleted for ${customer.id}: ${message}`);
            throw error;
        }
    }

    private async updateSubscriptionFromStripe(subscription: Stripe.Subscription): Promise<void> {
        try {
            const localSubscription = await this.subscriptionRepository.findByStripeId(subscription.id);
            if (!localSubscription) {
                this.logger.debug(`Subscription ${subscription.id} not found locally`);
                return;
            }

            await this.subscriptionRepository.update(localSubscription.id, {
                stripePriceId: subscription.items.data[0]?.price?.id || localSubscription.stripePriceId,
                status: this.mapStripeSubscriptionStatus(subscription.status),
                currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
                currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
                canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : undefined,
            });

            this.logger.log(`Updated subscription ${subscription.id}`);
        } catch (error) {
            const { message } = extractErrorInfo(error, 'Failed to update subscription');
            this.logger.error(`Failed to update subscription ${subscription.id}: ${message}`);
            throw error;
        }
    }

    private async updateInvoiceFromStripe(invoice: Stripe.Invoice): Promise<void> {
        try {
            const localInvoice = await this.billingRepository.findInvoiceByStripeId(invoice.id);
            if (!localInvoice) {
                this.logger.debug(`Invoice ${invoice.id} not found locally`);
                return;
            }

            await this.billingRepository.updateInvoice(localInvoice.id, {
                status: this.mapStripeInvoiceStatus(invoice.status!),
                amountDue: invoice.amount_due,
                amountPaid: invoice.amount_paid,
                subtotal: invoice.subtotal,
                tax: (invoice as any).tax || 0,
                total: invoice.total,
                invoicePdf: (invoice as any).invoice_pdf || undefined,
                hostedInvoiceUrl: (invoice as any).hosted_invoice_url || undefined,
                finalizedAt: invoice.status_transitions?.finalized_at ? new Date(invoice.status_transitions.finalized_at * 1000) : undefined,
                paidAt: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000) : undefined,
            });

            this.logger.log(`Updated invoice ${invoice.id}`);
        } catch (error) {
            const { message } = extractErrorInfo(error, 'Failed to update invoice');
            this.logger.error(`Failed to update invoice ${invoice.id}: ${message}`);
            throw error;
        }
    }

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

    private mapStripeInvoiceStatus(stripeStatus: string): InvoiceStatus {
        switch (stripeStatus) {
            case 'draft':
                return InvoiceStatus.DRAFT;
            case 'open':
                return InvoiceStatus.OPEN;
            case 'paid':
                return InvoiceStatus.PAID;
            case 'uncollectible':
                return InvoiceStatus.UNCOLLECTIBLE;
            case 'void':
                return InvoiceStatus.VOID;
            default:
                return InvoiceStatus.DRAFT;
        }
    }
}