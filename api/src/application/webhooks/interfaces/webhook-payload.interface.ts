export interface WebhookEventPayload<T = any> {
    eventType: string;
    eventVersion: string;
    tenantId: string;
    timestamp: string;
    eventId: string;
    data: T;
    previousData?: T;
}

export interface WebhookDeliveryResponse {
    success: boolean;
    statusCode?: number;
    response?: string;
    error?: string;
    duration: number;
    attempt: number;
}

export interface WebhookDeliveryRequest {
    webhookId: string;
    url: string;
    method: string;
    headers: Record<string, string>;
    payload: WebhookEventPayload;
    signature?: string;
    timeout: number;
}

export interface WebhookRetryConfig {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffFactor: number;
}

export interface WebhookEventContext {
    entityType: string;
    entityId: string;
    action: 'created' | 'updated' | 'deleted';
    tenantId: string;
    userId?: string;
    timestamp: Date;
}

export const WEBHOOK_EVENT_TYPES = {
    USER: {
        CREATED: 'user.created',
        UPDATED: 'user.updated',
        DELETED: 'user.deleted',
    },
    INVOICE: {
        CREATED: 'invoice.created',
        UPDATED: 'invoice.updated',
        DELETED: 'invoice.deleted',
        PAID: 'invoice.paid',
        CANCELLED: 'invoice.cancelled',
    },
    TENANT: {
        CREATED: 'tenant.created',
        UPDATED: 'tenant.updated',
        DELETED: 'tenant.deleted',
    },
} as const;

export type WebhookEventType = typeof WEBHOOK_EVENT_TYPES[keyof typeof WEBHOOK_EVENT_TYPES][keyof typeof WEBHOOK_EVENT_TYPES[keyof typeof WEBHOOK_EVENT_TYPES]];