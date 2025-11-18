// This file demonstrates how to integrate webhook events with existing services
// It can be used as a reference for integrating webhooks into services like UserCommands, InvoiceService, etc.

import { Injectable, Logger } from '@nestjs/common';
import { WebhookEventService } from './webhook-event.service';

// Example integration for UserService
@Injectable()
export class UserWebhookIntegration {
    private readonly logger = new Logger(UserWebhookIntegration.name);

    constructor(private readonly webhookEventService: WebhookEventService) {}

    // Example method showing how to integrate webhook events in user creation
    async onUserCreated(user: any, tenantId: string): Promise<void> {
        try {
            await this.webhookEventService.triggerUserEvent(
                'created',
                this.sanitizeUserData(user),
                tenantId,
                user.id
            );
        } catch (error) {
            this.logger.error(`Failed to trigger user.created webhook: ${error}`);
            // Don't throw - webhook failures shouldn't break the main operation
        }
    }

    async onUserUpdated(updatedUser: any, previousUser: any, tenantId: string): Promise<void> {
        try {
            await this.webhookEventService.triggerUserEvent(
                'updated',
                this.sanitizeUserData(updatedUser),
                tenantId,
                updatedUser.id,
                this.sanitizeUserData(previousUser)
            );
        } catch (error) {
            this.logger.error(`Failed to trigger user.updated webhook: ${error}`);
        }
    }

    async onUserDeleted(user: any, tenantId: string): Promise<void> {
        try {
            await this.webhookEventService.triggerUserEvent(
                'deleted',
                this.sanitizeUserData(user),
                tenantId,
                user.id
            );
        } catch (error) {
            this.logger.error(`Failed to trigger user.deleted webhook: ${error}`);
        }
    }

    private sanitizeUserData(user: any): any {
        // Remove sensitive data that shouldn't be sent to external webhooks
        const { password, subId, ...sanitizedUser } = user;
        return sanitizedUser;
    }
}

// Example integration for InvoiceService
@Injectable()
export class InvoiceWebhookIntegration {
    private readonly logger = new Logger(InvoiceWebhookIntegration.name);

    constructor(private readonly webhookEventService: WebhookEventService) {}

    async onInvoiceCreated(invoice: any, tenantId: string): Promise<void> {
        try {
            await this.webhookEventService.triggerInvoiceEvent(
                'created',
                invoice,
                tenantId,
                invoice.id
            );
        } catch (error) {
            this.logger.error(`Failed to trigger invoice.created webhook: ${error}`);
        }
    }

    async onInvoiceUpdated(updatedInvoice: any, previousInvoice: any, tenantId: string): Promise<void> {
        try {
            await this.webhookEventService.triggerInvoiceEvent(
                'updated',
                updatedInvoice,
                tenantId,
                updatedInvoice.id,
                undefined, // userId not available in invoice context
                previousInvoice
            );
        } catch (error) {
            this.logger.error(`Failed to trigger invoice.updated webhook: ${error}`);
        }
    }

    async onInvoiceDeleted(invoice: any, tenantId: string): Promise<void> {
        try {
            await this.webhookEventService.triggerInvoiceEvent(
                'deleted',
                invoice,
                tenantId,
                invoice.id
            );
        } catch (error) {
            this.logger.error(`Failed to trigger invoice.deleted webhook: ${error}`);
        }
    }

    async onInvoicePaid(invoice: any, tenantId: string): Promise<void> {
        try {
            // For special events like 'paid', you might need to extend the trigger methods
            // or use the generic processEntityEvent method
            await this.webhookEventService.processEntityEvent(
                {
                    entityType: 'invoice',
                    entityId: invoice.id,
                    action: 'updated', // Map 'paid' to updated with special context
                    tenantId,
                    timestamp: new Date(),
                },
                { ...invoice, status: 'paid' }
            );
        } catch (error) {
            this.logger.error(`Failed to trigger invoice.paid webhook: ${error}`);
        }
    }
}

// Example integration for TenantService
@Injectable()
export class TenantWebhookIntegration {
    private readonly logger = new Logger(TenantWebhookIntegration.name);

    constructor(private readonly webhookEventService: WebhookEventService) {}

    async onTenantCreated(tenant: any, userId?: string): Promise<void> {
        try {
            await this.webhookEventService.triggerTenantEvent(
                'created',
                tenant,
                tenant.id,
                userId
            );
        } catch (error) {
            this.logger.error(`Failed to trigger tenant.created webhook: ${error}`);
        }
    }

    async onTenantUpdated(updatedTenant: any, previousTenant: any, userId?: string): Promise<void> {
        try {
            await this.webhookEventService.triggerTenantEvent(
                'updated',
                updatedTenant,
                updatedTenant.id,
                userId,
                previousTenant
            );
        } catch (error) {
            this.logger.error(`Failed to trigger tenant.updated webhook: ${error}`);
        }
    }

    async onTenantDeleted(tenant: any, userId?: string): Promise<void> {
        try {
            await this.webhookEventService.triggerTenantEvent(
                'deleted',
                tenant,
                tenant.id,
                userId
            );
        } catch (error) {
            this.logger.error(`Failed to trigger tenant.deleted webhook: ${error}`);
        }
    }
}

// Instructions for Integration:
/*
To integrate webhooks into existing services:

1. Import WebhookEventService in your service constructor
2. Call the appropriate trigger method after successful operations
3. Wrap webhook calls in try-catch to prevent webhook failures from breaking main operations
4. Always sanitize data before sending to webhooks (remove passwords, secrets, etc.)
5. For complex events, use the generic processEntityEvent method

Example in UserCommands.createUser():

```typescript
// After line 127 (after successful user creation):
try {
    await this.webhookEventService.triggerUserEvent(
        'created',
        { id: createdUser.id, email: createdUser.email, firstName: createdUser.firstName, lastName: createdUser.lastName },
        tenantId,
        createdUser.id
    );
} catch (webhookError) {
    this.logger.error(`Failed to trigger user.created webhook: ${webhookError}`);
    // Continue with normal flow - webhook failures shouldn't break user creation
}
```

Remember to:
- Add WebhookEventService to your service's constructor dependencies
- Import WebhookModule in your service's module
- Always handle webhook errors gracefully
*/