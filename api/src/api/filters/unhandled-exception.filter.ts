import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { SentryExceptionCaptured } from '@sentry/nestjs';
import { Request, Response } from 'express';

@Catch()
export class UnhandledExceptionFilter implements ExceptionFilter {
    private readonly logger: Logger = new Logger(UnhandledExceptionFilter.name);

    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

    @SentryExceptionCaptured()
    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;
        const context = host.switchToHttp();
        const request = context.getRequest<Request>();
        const response = context.getResponse<Response>();

        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const responseBody =
            exception instanceof HttpException
                ? exception.getResponse()
                : { statusCode: httpStatus, message: 'Internal Server Error' };

        const path: string = httpAdapter.getRequestUrl(request) as string;

        this.logger.error(
            `Exception caught: ${JSON.stringify(exception)}, Path: ${path}`,
            exception instanceof Error ? exception.stack : undefined,
        );

        const responsePayload =
            typeof responseBody === 'string' ? { message: responseBody } : responseBody;

        httpAdapter.reply(response, responsePayload, httpStatus);
    }
}
