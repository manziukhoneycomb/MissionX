# Analytics API

This module provides comprehensive analytics capabilities for invoice and tenant data, with role-based access control restricting access to Admin and Super Admin users only.

## Features

### Core Analytics Endpoints

- **Comprehensive Dashboard** (`GET /analytics`) - All analytics data in one response
- **Revenue Trends** (`GET /analytics/revenue/trends`) - Monthly revenue trends
- **Monthly Revenue** (`GET /analytics/revenue/monthly`) - Monthly revenue breakdown
- **Quarterly Revenue** (`GET /analytics/revenue/quarterly`) - Quarterly revenue breakdown
- **Tenant Metrics** (`GET /analytics/tenants/metrics`) - Performance metrics per tenant
- **Top Customers** (`GET /analytics/customers/top`) - Top customers by revenue
- **Invoice Status** (`GET /analytics/invoices/status`) - Paid/unpaid/overdue overview
- **Invoice Aging** (`GET /analytics/invoices/aging`) - Aging analysis of outstanding invoices
- **Payment Distribution** (`GET /analytics/payments/distribution`) - Distribution by timing, amount, customer, vendor

### Query Parameters

All endpoints support these optional query parameters:
- `startDate` (YYYY-MM-DD) - Start date for analytics range
- `endDate` (YYYY-MM-DD) - End date for analytics range
- `tenantId` (UUID) - Filter by specific tenant (Super Admin only)
- `limit` (number) - Limit results for top customers endpoint

### Role-Based Access Control

- **Admin**: Can access analytics data for their own tenant only
- **Super Admin**: Can access analytics data for all tenants or filter by specific tenant

### Performance Features

- **Database Indexing**: Optimized indexes for analytics queries
- **In-Memory Caching**: 5-minute cache for expensive aggregations
- **Query Performance Monitoring**: Logging of query execution times
- **Error Handling**: Comprehensive error handling with meaningful messages

### Database Indexes

The following indexes are automatically created for optimal query performance:
- `IDX_INVOICES_TENANT_ID` - Single tenant filtering
- `IDX_INVOICES_ISSUE_DATE` - Date-based queries
- `IDX_INVOICES_DUE_DATE` - Aging analysis
- `IDX_INVOICES_TENANT_ISSUE_DATE` - Combined tenant and date filtering
- `IDX_INVOICES_TENANT_DUE_DATE` - Combined tenant and due date filtering
- `IDX_INVOICES_CUSTOMER_NAME` - Customer-based aggregations
- `IDX_INVOICES_VENDOR_NAME` - Vendor-based aggregations
- `IDX_INVOICES_TOTAL_AMOUNT` - Amount-based distributions
- `IDX_INVOICES_TENANT_CUSTOMER` - Combined tenant and customer queries
- `IDX_INVOICES_TENANT_VENDOR` - Combined tenant and vendor queries

### Error Handling

The API provides comprehensive error handling for:
- Invalid date formats and ranges
- Database connection issues
- Query timeouts
- Permission violations
- Invalid tenant IDs
- Date ranges exceeding 5 years

### Caching Strategy

- Cache key format: `analytics:{method}:{tenantId}:{startDate}:{endDate}`
- Cache timeout: 5 minutes
- Automatic cleanup of expired cache entries
- Performance logging for cache hits and misses

## Architecture

### Files Structure

```
src/application/analytics/
├── analytics.module.ts           # NestJS module configuration
├── analytics.service.ts          # Main service implementation
├── dto/                          # Data Transfer Objects
│   ├── analytics-response.dto.ts # Main response DTOs
│   ├── revenue-trend.dto.ts      # Revenue trend DTOs
│   ├── tenant-metrics.dto.ts     # Tenant performance DTOs
│   ├── invoice-status.dto.ts     # Invoice status DTOs
│   └── payment-distribution.dto.ts # Payment distribution DTOs
├── interfaces/
│   └── analytics.service.interface.ts # Service interface
└── utils/
    └── analytics-error.utils.ts  # Error handling utilities

src/api/controllers/
└── analytics.controller.ts       # REST API endpoints

src/infrastructure/persistence/migrations/
└── 1748425994517-AddAnalyticsIndexes.ts # Database indexes
```

### Dependencies

- TypeORM for database queries
- NestJS dependency injection
- Role-based authentication via `@Authorize` decorator
- Swagger/OpenAPI documentation

## Usage Examples

### Get comprehensive analytics
```typescript
GET /analytics?startDate=2023-01-01&endDate=2023-12-31
```

### Get revenue trends for specific tenant (Super Admin only)
```typescript
GET /analytics/revenue/trends?tenantId=123e4567-e89b-12d3-a456-426614174000
```

### Get top 5 customers
```typescript
GET /analytics/customers/top?limit=5
```

## Response Formats

All responses follow consistent DTO structures with proper typing and validation. See individual DTO files for detailed response schemas.