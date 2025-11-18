# Clerk Invitation System Setup Guide

This guide covers the setup and configuration of the Clerk-based invitation system for tenant user management.

## Environment Variables

Ensure the following environment variables are configured:

```bash
# Required for Clerk integration
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Client URL for invitation redirects
CLIENT_URL=http://localhost:3000

# Optional: Webhook secret for signature verification
CLERK_WEBHOOK_SECRET=your_webhook_secret
```

## Clerk Dashboard Configuration

### 1. Email Template Configuration

1. Go to your Clerk Dashboard
2. Navigate to **User & Authentication** > **Email & SMS**
3. Find the **Invitation** email template
4. Customize the template to include tenant-specific information

Example template variables available:
- `{{tenant_name}}` - Name of the tenant the user is being invited to
- `{{inviter_name}}` - Name of the user who sent the invitation
- `{{invitation_url}}` - Direct URL to accept the invitation

### 2. Invitation Settings

1. Go to **User & Authentication** > **Email & SMS**
2. Configure invitation expiration (default: 7 days)
3. Set up custom redirect URLs for invitation acceptance

### 3. Webhook Configuration

1. Go to **Webhooks** in the Clerk Dashboard
2. Create a new webhook endpoint: `{your_api_url}/webhooks/clerk/user-events`
3. Subscribe to the following events:
   - `user.created`
   - `user.updated`
4. Set the webhook secret in your environment variables

## API Endpoints

### Invite User to Tenant
```http
POST /api/users/tenants/{tenantId}/invite
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "roleIds": ["role-uuid-1", "role-uuid-2"],
  "message": "Welcome to our team!"
}
```

### List Tenant Invitations
```http
GET /api/users/tenants/{tenantId}/invitations
Authorization: Bearer {token}
```

### Revoke Invitation
```http
DELETE /api/users/tenants/{tenantId}/invitations/{invitationId}
Authorization: Bearer {token}
```

## Invitation Flow

1. **Admin sends invitation**:
   - Admin calls the invite API endpoint
   - System creates invitation via Clerk with tenant/role metadata
   - Clerk sends invitation email to the user

2. **User receives and accepts invitation**:
   - User clicks invitation link in email
   - User is redirected to sign-up/sign-in flow
   - User completes authentication

3. **System processes invitation acceptance**:
   - Webhook is triggered for user.created/user.updated
   - System processes invitation metadata
   - User is automatically assigned to correct tenant and roles

## Security Considerations

- All invitation endpoints require Admin or Super Admin role
- Admins can only invite users to their own tenant
- Super Admins can invite users to any tenant
- Webhook signature verification should be implemented for production

## Error Handling

- Invalid email addresses are rejected at API level
- Expired invitations are automatically handled by Clerk
- Failed webhook processing is logged but doesn't block user registration
- Invitation metadata is preserved in user's Clerk profile for audit

## Testing

Use the following curl commands to test the invitation system:

```bash
# Invite a user
curl -X POST "http://localhost:3001/api/users/tenants/your-tenant-id/invite" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "roleIds": ["admin-role-id"]
  }'

# List invitations
curl -X GET "http://localhost:3001/api/users/tenants/your-tenant-id/invitations" \
  -H "Authorization: Bearer your-jwt-token"
```

## Troubleshooting

### Common Issues

1. **Invitations not being sent**
   - Check CLERK_SECRET_KEY is valid
   - Verify email template is configured in Clerk Dashboard
   - Check API logs for error messages

2. **Users not getting proper roles after accepting invitation**
   - Verify webhook endpoint is configured correctly
   - Check webhook logs in Clerk Dashboard
   - Ensure invitation metadata includes correct tenant/role IDs

3. **Permission errors when inviting users**
   - Verify user has Admin role in the correct tenant
   - Check tenant middleware is working correctly
   - Ensure JWT token includes proper tenant information

### Debug Information

Enable debug logging by setting the log level to `debug` in your application configuration.

Check the following log entries:
- `Inviting user {email} to tenant {tenantId}`
- `Successfully created invitation {invitationId} for {email}`
- `Processing invitation acceptance for user {userId}, tenant {tenantId}`