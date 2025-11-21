export interface InvitationEmailData {
    recipientEmail: string;
    recipientFirstName?: string;
    tenantName: string;
    inviterName: string;
    invitationToken: string;
    message?: string;
    invitationUrl: string;
    expiresAt: Date;
}

export class InvitationEmailTemplate {
    static generateSubject(data: InvitationEmailData): string {
        return `You're invited to join ${data.tenantName}`;
    }

    static generateTextContent(data: InvitationEmailData): string {
        const greeting = data.recipientFirstName 
            ? `Hi ${data.recipientFirstName},`
            : `Hi there,`;

        const customMessage = data.message 
            ? `\n\n"${data.message}"\n`
            : '';

        return `${greeting}

${data.inviterName} has invited you to join ${data.tenantName}.${customMessage}

To accept this invitation, please click the link below:
${data.invitationUrl}

This invitation will expire on ${data.expiresAt.toLocaleDateString()} at ${data.expiresAt.toLocaleTimeString()}.

If you have any questions, please contact your administrator.

Best regards,
The ${data.tenantName} Team

---
If you received this email by mistake, you can safely ignore it.`;
    }

    static generateHtmlContent(data: InvitationEmailData): string {
        const greeting = data.recipientFirstName 
            ? `Hi ${data.recipientFirstName},`
            : `Hi there,`;

        const customMessage = data.message 
            ? `<div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0; font-style: italic;">
                "${data.message}"
              </div>`
            : '';

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation to ${data.tenantName}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .invitation-card { background: #ffffff; border: 1px solid #e1e5e9; border-radius: 8px; padding: 30px; margin: 20px 0; }
        .btn { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500; }
        .btn:hover { background-color: #0056b3; }
        .footer { margin-top: 30px; font-size: 14px; color: #6c757d; text-align: center; }
        .expiry-notice { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 12px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="color: #007bff; margin: 0;">You're Invited!</h1>
        </div>
        
        <div class="invitation-card">
            <p style="font-size: 18px; margin-bottom: 20px;">${greeting}</p>
            
            <p><strong>${data.inviterName}</strong> has invited you to join <strong>${data.tenantName}</strong>.</p>
            
            ${customMessage}
            
            <p>To get started, please accept your invitation:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.invitationUrl}" class="btn">Accept Invitation</a>
            </div>
            
            <div class="expiry-notice">
                <strong>⏰ Important:</strong> This invitation will expire on 
                <strong>${data.expiresAt.toLocaleDateString()}</strong> at 
                <strong>${data.expiresAt.toLocaleTimeString()}</strong>.
            </div>
            
            <p>If you have any questions, please contact your administrator.</p>
            
            <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>The ${data.tenantName} Team</strong>
            </p>
        </div>
        
        <div class="footer">
            <p>If you received this email by mistake, you can safely ignore it.</p>
            <p>This invitation link is unique to you and should not be shared.</p>
        </div>
    </div>
</body>
</html>`;
    }
}