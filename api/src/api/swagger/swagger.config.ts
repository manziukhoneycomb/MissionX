import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwaggerDocs(app: INestApplication) {
    try {
        const builder = new DocumentBuilder()
            .setTitle('API')
            .setDescription('')
            .setVersion('1.0')
            .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
            .addSecurityRequirements('access-token')
            .build();

        const document = SwaggerModule.createDocument(app, builder);

        const uiOptions = {
            swaggerOptions: {
                docExpansion: 'list',
                persistAuthorization: true,
                tagsSorter: 'alpha',
            },
        };

        SwaggerModule.setup('/swagger', app, document, uiOptions);
    } catch (error: unknown) {
        console.error('Error setting up Swagger:', error);
    }
}
