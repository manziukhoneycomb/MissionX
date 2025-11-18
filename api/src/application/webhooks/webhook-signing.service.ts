import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class WebhookSigningService {
    generateSignature(payload: string, secret: string, algorithm: string = 'sha256'): string {
        if (!secret) {
            throw new Error('Webhook secret is required for signing');
        }

        const hmac = crypto.createHmac(algorithm, secret);
        hmac.update(payload, 'utf8');
        return `${algorithm}=${hmac.digest('hex')}`;
    }

    verifySignature(
        payload: string,
        signature: string,
        secret: string,
        algorithm: string = 'sha256',
    ): boolean {
        try {
            if (!secret || !signature || !payload) {
                return false;
            }

            const expectedSignature = this.generateSignature(payload, secret, algorithm);
            
            return crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(expectedSignature)
            );
        } catch (error) {
            return false;
        }
    }

    createWebhookHeaders(
        payload: string,
        secret?: string,
        customHeaders: Record<string, string> = {},
        timestamp?: Date,
    ): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'User-Agent': 'MissionX-Webhooks/1.0',
            'X-Webhook-Timestamp': (timestamp || new Date()).toISOString(),
            ...customHeaders,
        };

        if (secret) {
            headers['X-Webhook-Signature'] = this.generateSignature(payload, secret);
        }

        return headers;
    }
}