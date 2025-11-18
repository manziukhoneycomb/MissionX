# Webhook Delivery System

This module implements a comprehensive webhook delivery system for sending real-time event notifications to external endpoints.

## Components

### 1. WebhookSigningService
- Generates HMAC signatures for webhook payloads
- Verifies webhook signatures for security
- Creates proper webhook headers with timestamps and signatures

### 2. WebhookDeliveryService
- Handles HTTP delivery of webhooks to external endpoints
- Implements exponential backoff retry logic with jitter
- Manages timeouts and error handling
- Supports multiple HTTP methods
- Creates standardized event payloads

### 3. WebhookEventService
- Orchestrates webhook delivery for entity events
- Integrates with the application's event system
- Processes multiple webhooks in parallel
- Logs all delivery attempts
- Provides helper methods for common entity events (user, invoice, tenant)

## Features

### Retry Logic
- Exponential backoff with configurable base delay and backoff factor
- Jitter to prevent thundering herd problems
- Maximum retry attempts and delay limits
- Smart retry decisions based on HTTP status codes (retries 5xx, 429, network errors)

### Security
- HMAC-SHA256 signature verification
- Configurable webhook secrets
- Timestamp headers to prevent replay attacks
- Signature validation with timing-safe comparison

### Logging
- Comprehensive logging of all delivery attempts
- Performance metrics (duration, attempt count)
- Error details for debugging
- Success/failure status tracking

### Integration Points
- Event-driven architecture
- Support for all entity types (user, invoice, tenant)
- Extensible event types
- Sanitized data payloads

## Configuration

Webhooks can be configured with:
- `url`: Target endpoint URL
- `method`: HTTP method (GET, POST, PUT, etc.)
- `events`: Array of event types to subscribe to
- `secret`: Secret for HMAC signing
- `headers`: Custom headers to include
- `retryPolicy`: Retry configuration (maxRetries, timeout)

## Event Types

The system supports the following event types:

### User Events
- `user.created`
- `user.updated`
- `user.deleted`

### Invoice Events
- `invoice.created`
- `invoice.updated`
- `invoice.deleted`
- `invoice.paid`
- `invoice.cancelled`

### Tenant Events
- `tenant.created`
- `tenant.updated`
- `tenant.deleted`

## Usage Example

```typescript
// Inject the service
constructor(private readonly webhookEventService: WebhookEventService) {}

// Trigger a webhook event
await this.webhookEventService.triggerUserEvent(
    'created',
    userData,
    tenantId,
    userId
);
```

## Integration

To integrate with existing services, see `webhook-integration.example.ts` for detailed examples of how to add webhook triggers to your service methods.

## Dependencies

- **axios**: HTTP client for webhook delivery
- **crypto**: Node.js crypto module for HMAC signing
- **@nestjs/common**: NestJS core functionality

## Error Handling

The system is designed to be resilient:
- Webhook failures don't break main application operations
- All errors are logged for debugging
- Automatic retries for transient failures
- Graceful degradation when external endpoints are unavailable

## Performance Considerations

- Webhooks are delivered in parallel for better performance
- Configurable timeouts prevent hanging requests
- Exponential backoff prevents overwhelming failing endpoints
- Response truncation prevents memory issues with large responses