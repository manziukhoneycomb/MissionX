// This file demonstrates how the webhook system would integrate with existing services
// This is an example file showing the integration pattern - not meant to be imported

import { Injectable } from '@nestjs/common';
import { WebhookEventProcessorService } from '../webhook-event-processor.service';
import { InvoiceDto } from '../../invoices/dto/invoice.dto';

@Injectable()
export class InvoiceServiceWithWebhooks {
    constructor(
        private readonly webhookEventProcessor: WebhookEventProcessorService,
        // private readonly originalInvoiceService: InvoiceService,
    ) {}

    // Example of how invoice creation would trigger webhooks
    async createInvoice(invoiceData: any, tenantId: string): Promise<InvoiceDto> {
        // Create the invoice using the original service
        // const invoice = await this.originalInvoiceService.create(invoiceData, tenantId);
        const invoice = {} as InvoiceDto; // Placeholder for example

        // Trigger webhook event
        await this.webhookEventProcessor.triggerInvoiceEvent(
            'created',
            {
                id: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                totalAmount: invoice.totalAmount,
                // ... other relevant invoice data
            },
            tenantId,
        );

        return invoice;
    }

    // Example of how invoice updates would trigger webhooks
    async updateInvoice(id: string, updateData: any, tenantId: string): Promise<InvoiceDto> {
        // Update the invoice using the original service
        // const invoice = await this.originalInvoiceService.update(id, updateData, tenantId);
        const invoice = {} as InvoiceDto; // Placeholder for example

        // Trigger webhook event
        await this.webhookEventProcessor.triggerInvoiceEvent(
            'updated',
            {
                id: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                totalAmount: invoice.totalAmount,
                // ... other relevant invoice data
            },
            tenantId,
        );

        return invoice;
    }

    // Example of how invoice deletion would trigger webhooks
    async deleteInvoice(id: string, tenantId: string): Promise<void> {
        // Get invoice before deletion
        // const invoice = await this.originalInvoiceService.findById(id, tenantId);
        
        // Delete the invoice using the original service
        // await this.originalInvoiceService.remove(id, tenantId);

        // Trigger webhook event
        await this.webhookEventProcessor.triggerInvoiceEvent(
            'deleted',
            {
                id,
                // ... other relevant invoice data from the deleted invoice
            },
            tenantId,
        );
    }

    // Example of a custom business event (invoice payment)
    async markInvoiceAsPaid(id: string, paymentData: any, tenantId: string): Promise<InvoiceDto> {
        // Update invoice status to paid
        // const invoice = await this.originalInvoiceService.markAsPaid(id, paymentData, tenantId);
        const invoice = {} as InvoiceDto; // Placeholder for example

        // Trigger webhook event
        await this.webhookEventProcessor.triggerInvoiceEvent(
            'paid',
            {
                id: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                totalAmount: invoice.totalAmount,
                paymentData,
                // ... other relevant invoice data
            },
            tenantId,
        );

        return invoice;
    }
}

/* 
Integration Notes:

1. To integrate this webhook system with existing services:
   - Import WebhookEventProcessorService in the service modules
   - Add webhook event triggers after successful operations
   - Use the appropriate event types (user.*, invoice.*, tenant.*)

2. Event Payload Structure:
   - Include relevant entity data that external systems need
   - Always include entity ID and tenant ID
   - Consider what data consumers of your webhooks would need

3. Error Handling:
   - Webhook delivery failures should not break the main business logic
   - The webhook system handles retries and logging automatically
   - Consider making webhook processing asynchronous for better performance

4. Security:
   - Webhook signatures are automatically generated when secrets are configured
   - Receiving systems should verify signatures using the same HMAC-SHA256 algorithm
   - Use HTTPS endpoints for webhook URLs in production

5. Performance Considerations:
   - Webhook delivery is synchronous in this implementation
   - For high-volume applications, consider using a message queue
   - The system supports multiple webhooks per event type per tenant
*/