import { Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';
import { WebhookEventPayload } from './interfaces/webhook-payload.interface';

@Injectable()
export class WebhookSigningService {
    generateSignature(payload: WebhookEventPayload, secret: string): string {
        const payloadString = JSON.stringify(payload);
        const signature = createHmac('sha256', secret)
            .update(payloadString)
            .digest('hex');
        
        return `sha256=${signature}`;
    }

    verifySignature(payload: WebhookEventPayload, signature: string, secret: string): boolean {
        const expectedSignature = this.generateSignature(payload, secret);
        return this.secureCompare(signature, expectedSignature);
    }

    private secureCompare(a: string, b: string): boolean {
        if (a.length !== b.length) {
            return false;
        }

        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }

        return result === 0;
    }
}