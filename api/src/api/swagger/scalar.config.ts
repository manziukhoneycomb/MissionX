import { DocumentBuilder } from '@nestjs/swagger';

import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { apiReference, ApiReferenceOptions } from '@scalar/nestjs-api-reference';
import { Request, Response } from 'express';

const OPEN_API_PATH = '/openapi.json';

export function setupScalarDocs(app: INestApplication): void {
    try {
        const openApiConfig = new DocumentBuilder()
            .setTitle('API')
            .setDescription('')
            .setVersion('1.0')
            .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
            .addSecurityRequirements('access-token')
            .build();

        const openApiDoc = SwaggerModule.createDocument(app, openApiConfig);

        app.getHttpAdapter().get(OPEN_API_PATH, (_req: Request, res: Response) =>
            res.json(openApiDoc),
        );

        const scalarOptions: ApiReferenceOptions = {
            url: OPEN_API_PATH,
            theme: 'nest',
            layout: 'sidebar',
            persistAuth: true,
            hideDownloadButton: false,
        };

        app.use('/scalar', apiReference(scalarOptions));
    } catch (error: unknown) {
        console.error('Error setting up Scalar docs:', error);
    }
}
