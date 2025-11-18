import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'crypto';

@Injectable()
export class WebhookValidatorService {
    private readonly logger = new Logger(WebhookValidatorService.name);

    validateWebhookSignature(
        payload: string,
        signature: string,
        secret: string,
    ): boolean {
        if (!signature || !secret) {
            this.logger.warn('Missing webhook signature or secret');
            return false;
        }

        try {
            // Azure DevOps webhooks use HMAC-SHA256
            const expectedSignature = this.generateSignature(payload, secret);
            
            // Compare signatures securely
            const providedSignature = signature.toLowerCase();
            const calculatedSignature = expectedSignature.toLowerCase();
            
            return this.secureCompare(providedSignature, calculatedSignature);
        } catch (error) {
            this.logger.error('Error validating webhook signature:', error);
            return false;
        }
    }

    validateWebhookRequest(
        headers: Record<string, string | string[]>,
        payload: any,
        allowedIPs?: string[],
    ): {
        isValid: boolean;
        eventType?: string;
        subscriptionId?: string;
        errors: string[];
    } {
        const errors: string[] = [];
        let isValid = true;
        
        // Extract headers (case-insensitive)
        const normalizedHeaders = this.normalizeHeaders(headers);
        
        // Validate required headers
        const eventType = normalizedHeaders['x-vss-activityid'] || 
                         normalizedHeaders['x-tfs-eventtype'] ||
                         payload?.eventType;
        
        if (!eventType) {
            errors.push('Missing event type header');
            isValid = false;
        }

        // Validate subscription ID
        const subscriptionId = normalizedHeaders['x-vss-subscriptionid'] || 
                              payload?.subscriptionId;
        
        if (!subscriptionId) {
            errors.push('Missing subscription ID');
            isValid = false;
        }

        // Validate content type
        const contentType = normalizedHeaders['content-type'];
        if (!contentType || !contentType.includes('application/json')) {
            errors.push('Invalid content type, expected application/json');
            isValid = false;
        }

        // Validate IP address if allowlist is provided
        if (allowedIPs && allowedIPs.length > 0) {
            const clientIP = this.extractClientIP(headers);
            if (!this.validateIPAddress(clientIP, allowedIPs)) {
                errors.push(`Unauthorized IP address: ${clientIP}`);
                isValid = false;
            }
        }

        // Validate payload structure
        if (!this.validatePayloadStructure(payload)) {
            errors.push('Invalid payload structure');
            isValid = false;
        }

        return {
            isValid,
            eventType,
            subscriptionId,
            errors,
        };
    }

    validatePayloadStructure(payload: any): boolean {
        if (!payload || typeof payload !== 'object') {
            return false;
        }

        // Check for required Azure DevOps webhook fields
        const requiredFields = [
            'eventType',
            'publisherId',
            'resource',
        ];

        for (const field of requiredFields) {
            if (!(field in payload)) {
                this.logger.warn(`Missing required field: ${field}`);
                return false;
            }
        }

        // Validate resource structure
        if (!payload.resource || typeof payload.resource !== 'object') {
            this.logger.warn('Invalid resource structure');
            return false;
        }

        return true;
    }

    extractWorkItemId(payload: any): number | null {
        try {
            // Try different paths where work item ID might be located
            const resourceId = payload.resource?.id;
            const workItemId = payload.resource?.workItemId;
            const detailsId = payload.resourceContainers?.project?.id;

            if (typeof resourceId === 'number') {
                return resourceId;
            }

            if (typeof workItemId === 'number') {
                return workItemId;
            }

            // Try parsing from URL if present
            const resourceUrl = payload.resource?.url;
            if (resourceUrl && typeof resourceUrl === 'string') {
                const match = resourceUrl.match(/workitems\/(\d+)/i);
                if (match) {
                    return parseInt(match[1], 10);
                }
            }

            return null;
        } catch (error) {
            this.logger.error('Error extracting work item ID:', error);
            return null;
        }
    }

    isWorkItemEvent(eventType: string): boolean {
        const workItemEventTypes = [
            'workitem.created',
            'workitem.updated',
            'workitem.deleted',
            'workitem.restored',
            'workitem.commented',
        ];

        return workItemEventTypes.includes(eventType.toLowerCase());
    }

    shouldProcessEvent(payload: any, eventType: string): boolean {
        // Only process work item events
        if (!this.isWorkItemEvent(eventType)) {
            return false;
        }

        // Skip events that don't have a valid work item ID
        const workItemId = this.extractWorkItemId(payload);
        if (!workItemId) {
            return false;
        }

        // Skip events for deleted work items (unless it's a restore event)
        if (eventType === 'workitem.deleted' && !eventType.includes('restored')) {
            return false;
        }

        return true;
    }

    private generateSignature(payload: string, secret: string): string {
        const hmac = createHmac('sha256', secret);
        hmac.update(payload, 'utf8');
        return `sha256=${hmac.digest('hex')}`;
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

    private normalizeHeaders(headers: Record<string, string | string[]>): Record<string, string> {
        const normalized: Record<string, string> = {};
        
        for (const [key, value] of Object.entries(headers)) {
            const normalizedKey = key.toLowerCase();
            const normalizedValue = Array.isArray(value) ? value[0] : value;
            normalized[normalizedKey] = normalizedValue;
        }

        return normalized;
    }

    private extractClientIP(headers: Record<string, string | string[]>): string {
        const normalizedHeaders = this.normalizeHeaders(headers);
        
        // Try various headers in order of preference
        const ipHeaders = [
            'x-forwarded-for',
            'x-real-ip',
            'cf-connecting-ip',
            'x-client-ip',
            'x-cluster-client-ip',
        ];

        for (const header of ipHeaders) {
            const value = normalizedHeaders[header];
            if (value) {
                // x-forwarded-for can contain multiple IPs, take the first one
                const ip = value.split(',')[0].trim();
                if (this.isValidIP(ip)) {
                    return ip;
                }
            }
        }

        return 'unknown';
    }

    private validateIPAddress(clientIP: string, allowedIPs: string[]): boolean {
        if (!clientIP || clientIP === 'unknown') {
            return false;
        }

        // Check exact matches first
        if (allowedIPs.includes(clientIP)) {
            return true;
        }

        // Check CIDR ranges
        for (const allowedIP of allowedIPs) {
            if (allowedIP.includes('/')) {
                if (this.isIPInCIDR(clientIP, allowedIP)) {
                    return true;
                }
            }
        }

        return false;
    }

    private isValidIP(ip: string): boolean {
        // Basic IPv4 validation
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (ipv4Regex.test(ip)) {
            const parts = ip.split('.');
            return parts.every(part => {
                const num = parseInt(part, 10);
                return num >= 0 && num <= 255;
            });
        }

        // Basic IPv6 validation (simplified)
        const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return ipv6Regex.test(ip);
    }

    private isIPInCIDR(ip: string, cidr: string): boolean {
        try {
            const [network, prefixLength] = cidr.split('/');
            const prefix = parseInt(prefixLength, 10);
            
            // Convert IPs to binary for comparison (simplified for IPv4)
            if (ip.includes('.') && network.includes('.')) {
                const ipBinary = this.ipToBinary(ip);
                const networkBinary = this.ipToBinary(network);
                
                // Compare first 'prefix' bits
                const mask = '1'.repeat(prefix) + '0'.repeat(32 - prefix);
                const ipMasked = this.applyBinaryMask(ipBinary, mask);
                const networkMasked = this.applyBinaryMask(networkBinary, mask);
                
                return ipMasked === networkMasked;
            }
            
            return false;
        } catch (error) {
            this.logger.warn(`Error validating CIDR ${cidr}:`, error);
            return false;
        }
    }

    private ipToBinary(ip: string): string {
        return ip.split('.')
            .map(octet => parseInt(octet, 10).toString(2).padStart(8, '0'))
            .join('');
    }

    private applyBinaryMask(binary: string, mask: string): string {
        let result = '';
        for (let i = 0; i < binary.length; i++) {
            result += mask[i] === '1' ? binary[i] : '0';
        }
        return result;
    }

    logWebhookEvent(
        eventType: string,
        subscriptionId: string,
        workItemId?: number,
        success = true,
        error?: string,
    ): void {
        const logData = {
            eventType,
            subscriptionId,
            workItemId,
            success,
            error,
            timestamp: new Date().toISOString(),
        };

        if (success) {
            this.logger.log(`Webhook processed successfully: ${JSON.stringify(logData)}`);
        } else {
            this.logger.error(`Webhook processing failed: ${JSON.stringify(logData)}`);
        }
    }
}