import {
    OPENAI_API_KEY,
    OPENAI_IMAGE_GENERATION_MODEL,
    OPENAI_MODEL,
    SELECTED_MODEL_PROVIDER,
} from '../config';
import { TableSchema } from '../types';
import {
    FormattingResult,
    SqlGenerationParams,
    SqlGenerationResult,
} from '../types/model-strategy';
import { ModelFactory, ModelType } from './model-factory';
import { OpenAIStrategy } from '../models/openai-strategy';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { McpService } from './mcp.service';

/**
 * Service for interacting with language model strategies
 */
@Injectable()
export class ModelService implements OnModuleInit {
    private readonly selectedStrategy: ModelType;
    private readonly logger = new Logger(ModelService.name);

    constructor(private readonly mcpService: McpService) {
        this.selectedStrategy = SELECTED_MODEL_PROVIDER as ModelType;
    }

    /**
     * Initialize all model strategies when the module is ready
     */
    onModuleInit(): void {
        this.initializeStrategies();
    }

    /**
     * Initialize all model strategies with configuration
     */
    private initializeStrategies(): void {
        // Log MCP tools availability
        const mcpTools = this.mcpService.getTools();
        this.logger.log(
            `Initializing model strategies with ${mcpTools.length} MCP tools available`,
        );

        // OpenAI strategy
        ModelFactory.getStrategy('openai', {
            apiKey: OPENAI_API_KEY,
            model: OPENAI_MODEL,
            imageGenerationModel: OPENAI_IMAGE_GENERATION_MODEL,
            temperature: 1,
        });

        this.logger.log(`Model strategies initialized successfully`);
    }

    /**
     * Get the current strategy instance
     * This method is primarily for backward compatibility
     */
    public getStrategy(): OpenAIStrategy {
        const strategy = ModelFactory.getStrategy(this.selectedStrategy, {});
        return strategy as OpenAIStrategy;
    }

    /**
     * Generate SQL from natural language
     */
    public async generateSql(
        question: string,
        schemaInfo: Record<string, TableSchema>,
    ): Promise<SqlGenerationResult> {
        this.logger.log(`Using model provider: ${this.selectedStrategy}`);

        const strategy = ModelFactory.getStrategy(this.selectedStrategy, {});

        const params: SqlGenerationParams = {
            question: question,
            schemaInfo: schemaInfo,
        };

        return strategy.generateSql(params);
    }

    /**
     * Format query results
     */
    public async formatResults(
        originalQuestion: string,
        sql: string,
        queryResult: unknown,
    ): Promise<FormattingResult> {
        this.logger.log(`Formatting results with provider: ${this.selectedStrategy}`);

        const strategy = ModelFactory.getStrategy(this.selectedStrategy, {});

        return strategy.formatResults({
            originalQuestion,
            sql,
            queryResult,
        });
    }
}
