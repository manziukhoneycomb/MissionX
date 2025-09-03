import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

interface HealthCheckResponse {
    status: string;
    timestamp: string;
    uptime: number;
    version: string;
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Health check',
        description: 'Returns the health status of the application',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Application is healthy',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'ok' },
                timestamp: { type: 'string', example: '2025-09-03T10:00:00.000Z' },
                uptime: { type: 'number', example: 12345 },
                version: { type: 'string', example: '1.0.0' },
            },
        },
    })
    async getHealth(): Promise<HealthCheckResponse> {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
        };
    }
}