export interface WebhookEventPayload {
    event: string;
    timestamp: Date;
    data: Record<string, any>;
    metadata: {
        tenantId: string;
        entityId: string;
        entityType: string;
        version: string;
    };
}

export interface WebhookDeliveryResponse {
    success: boolean;
    status: number;
    response?: string;
    error?: string;
    responseTime: number;
    timestamp: Date;
}

export interface WebhookRetryPolicy {
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
}

export interface WebhookHeaders {
    [key: string]: string;
}

export interface WebhookDeliveryAttempt {
    attemptNumber: number;
    timestamp: Date;
    status: number;
    response?: string;
    error?: string;
    responseTime: number;
}

export interface WebhookDeliveryRequest {
    url: string;
    method: string;
    headers: WebhookHeaders;
    payload: WebhookEventPayload;
    signature?: string;
    timeout: number;
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

export type WebhookEventType = 
    | typeof WEBHOOK_EVENT_TYPES.USER[keyof typeof WEBHOOK_EVENT_TYPES.USER]
    | typeof WEBHOOK_EVENT_TYPES.INVOICE[keyof typeof WEBHOOK_EVENT_TYPES.INVOICE]
    | typeof WEBHOOK_EVENT_TYPES.TENANT[keyof typeof WEBHOOK_EVENT_TYPES.TENANT];