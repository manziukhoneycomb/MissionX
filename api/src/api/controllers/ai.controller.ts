import { Body, Controller, HttpException, HttpStatus, Logger, Post } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiUnauthorizedResponse,
    ApiBody,
} from '@nestjs/swagger';
import { MAX_SQL_GENERATION_ATTEMPTS } from '../../infrastructure/llm/config';
import { ModelService } from '../../infrastructure/llm/services/model-service';
import { McpService } from '../../infrastructure/llm/services/mcp.service';
import { AskAboutDataDto } from '../../infrastructure/llm/dtos/ask-about-data.dto';
import { AskAboutDataResponseDto } from '../../infrastructure/llm/dtos/ask-about-data-response.dto';
import { SqlGenerationResult } from '../../infrastructure/llm/types/model-strategy';
import { initializeSchemaInfo } from '../../infrastructure/llm/utils/schema';
@ApiTags('AI')
@Controller('ai')
export class AiController {
    private readonly logger = new Logger(AiController.name);

    constructor(
        private readonly modelService: ModelService,
        private readonly mcpService: McpService,
    ) {}

    @Post('ask-about-data')
    @ApiOperation({
        summary: 'Ask about data',
        description: 'Ask questions about your data and get AI-generated insights',
    })
    @ApiBody({ type: AskAboutDataDto })
    @ApiResponse({
        status: 200,
        description: 'Data retrieved successfully',
        type: AskAboutDataResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - Missing query',
    })
    @ApiResponse({
        status: 503,
        description: 'Service unavailable - MCP Client not available',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async askAboutData(@Body() body: AskAboutDataDto): Promise<AskAboutDataResponseDto> {
        const { query } = body;

        if (!this.mcpService.getClient()) {
            throw new HttpException(
                'MCP Client not available. Cannot process request.',
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }

        if (!query) {
            throw new HttpException('Missing query in request body', HttpStatus.BAD_REQUEST);
        }

        try {
            // Use globally stored schema first, fall back to extraction if needed
            const schemaInfo = await initializeSchemaInfo(this.mcpService.getClient()!);

            this.logger.log(
                `Processing query: "${query}" with schema containing ${Object.keys(schemaInfo).length} tables`,
            );

            // Generate SQL using the model service
            let result: SqlGenerationResult | undefined;
            let attempts = 0;
            while (attempts < MAX_SQL_GENERATION_ATTEMPTS) {
                result = await this.modelService.generateSql(query, schemaInfo);
                this.logger.debug(`SQL generation attempt ${attempts + 1} result:`, result);

                if (result.sql) {
                    break;
                }

                this.logger.warn(`No SQL generated on attempt ${attempts + 1}, retrying...`);
                attempts++;
            }

            // If no SQL was generated after all attempts, return the response as is
            if (!result?.sql) {
                return {
                    response:
                        result?.message ||
                        `No SQL could be generated from your query after ${MAX_SQL_GENERATION_ATTEMPTS} attempts.`,
                };
            }

            // We have SQL, execute it using MCP
            this.logger.log(`Executing generated SQL: ${result.sql}`);

            try {
                // Execute the query using the MCP service
                const queryResult = await this.mcpService.callMcpTool('query', { sql: result.sql });
                this.logger.debug('SQL execution result received');

                // Format the results using the model service
                this.logger.log('Formatting results...');
                const formattedResponse = await this.modelService.formatResults(
                    query,
                    result.sql,
                    queryResult,
                );
                this.logger.debug('Formatted response received');

                // Create the response object with the text response
                const responseObject: AskAboutDataResponseDto = {
                    response: formattedResponse.text,
                    sql: result.sql,
                    rawResult: queryResult,
                };

                // Add the image if one was generated
                if (formattedResponse.image) {
                    this.logger.log(
                        `Including image data in response (length: ${formattedResponse.image.length})`,
                    );
                    responseObject.image = formattedResponse.image;
                }

                // Return the formatted response
                return responseObject;
            } catch (sqlError: unknown) {
                // SQL execution failed - return error without retrying
                let errorMessage = 'Error executing SQL query';
                if (sqlError instanceof Error) {
                    errorMessage = sqlError.message;
                } else if (typeof sqlError === 'string') {
                    errorMessage = sqlError;
                }

                this.logger.error(`SQL execution error: ${errorMessage}`);

                return {
                    response: `I couldn't execute the SQL query. Error: ${errorMessage}`,
                    sql: result.sql,
                    error: errorMessage,
                };
            }
        } catch (error: unknown) {
            this.logger.error('Error in ask-about-data endpoint:', error);
            throw error instanceof Error ? error : new Error(String(error));
        }
    }
}
