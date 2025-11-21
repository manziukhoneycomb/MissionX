import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

// Core services
import { BillingService } from './billing.service';

// Entities
import { Subscription } from './entities/subscription.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { BillingDetails } from './entities/billing-details.entity';
import { Invoice, InvoiceLineItem } from './entities/invoice.entity';

// Repositories
import { BillingRepository } from './repositories/billing.repository';
import { SubscriptionRepository } from './repositories/subscription.repository';

// Services
import { StripeIntegrationService } from './services/stripe-integration.service';
import { WebhookHandlerService } from './services/webhook-handler.service';

// Commands
import { CreateSubscriptionHandler } from './commands/create-subscription.command';
import { UpdateSubscriptionHandler } from './commands/update-subscription.command';
import { CancelSubscriptionHandler } from './commands/cancel-subscription.command';
import { AddPaymentMethodHandler } from './commands/add-payment-method.command';
import { UpdatePaymentMethodHandler } from './commands/update-payment-method.command';
import { RemovePaymentMethodHandler } from './commands/remove-payment-method.command';

// Queries
import { GetSubscriptionHandler, GetSubscriptionByIdHandler } from './queries/get-subscription.query';
import { GetPaymentMethodsHandler } from './queries/get-payment-methods.query';
import { GetInvoicesHandler } from './queries/get-invoices.query';
import { GetBillingOverviewHandler } from './queries/get-billing-overview.query';

// Controllers
import { BillingController } from './controllers/billing.controller';
import { SubscriptionController } from './controllers/subscription.controller';
import { PaymentMethodsController } from './controllers/payment-methods.controller';
import { StripeWebhookController } from './controllers/stripe-webhook.controller';

// Middleware
import { PaymentSecurityMiddleware } from './middleware/payment-security.middleware';

@Module({
    imports: [
        ConfigModule,
        CqrsModule,
        TypeOrmModule.forFeature([
            Subscription,
            PaymentMethod,
            BillingDetails,
            Invoice,
            InvoiceLineItem,
        ]),
    ],
    providers: [
        BillingService,
        
        // Repositories
        BillingRepository,
        SubscriptionRepository,
        
        // Services
        StripeIntegrationService,
        WebhookHandlerService,
        
        // Command handlers
        CreateSubscriptionHandler,
        UpdateSubscriptionHandler,
        CancelSubscriptionHandler,
        AddPaymentMethodHandler,
        UpdatePaymentMethodHandler,
        RemovePaymentMethodHandler,
        
        // Query handlers
        GetSubscriptionHandler,
        GetSubscriptionByIdHandler,
        GetPaymentMethodsHandler,
        GetInvoicesHandler,
        GetBillingOverviewHandler,
        
        // Middleware
        PaymentSecurityMiddleware,
    ],
    controllers: [
        BillingController,
        SubscriptionController,
        PaymentMethodsController,
        StripeWebhookController,
    ],
    exports: [
        BillingService,
        BillingRepository,
        SubscriptionRepository,
        StripeIntegrationService,
        PaymentSecurityMiddleware,
    ],
})
export class BillingModule {}