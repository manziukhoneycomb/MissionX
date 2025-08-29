import {
    FormattingResult,
    ModelConfig,
    ModelStrategy,
    ResultFormattingParams,
    SqlGenerationParams,
    SqlGenerationResult,
} from '../types/model-strategy';

/**
 * Abstract base class for all model strategies
 */
export abstract class BaseModelStrategy implements ModelStrategy {
    protected readonly config: ModelConfig;

    constructor(
        public readonly name: string,
        config: ModelConfig,
    ) {
        this.config = {
            temperature: 0.3,
            ...config,
        };
    }

    /**
     * Validate that the strategy has all required configuration
     */
    public validateConfig(): boolean {
        // Base validation - subclasses should override with specific validation
        return true;
    }

    /**
     * Generate SQL from natural language query
     */
    public abstract generateSql(params: SqlGenerationParams): Promise<SqlGenerationResult>;

    /**
     * Format query results into human-readable text/visualizations
     */
    public abstract formatResults(params: ResultFormattingParams): Promise<FormattingResult>;

    /**
     * Helper method to handle API errors consistently
     */
    protected handleApiError(error: unknown, context: string): never {
        console.error(`Error in ${this.name} strategy - ${context}:`, error);

        if (error instanceof Error) {
            throw error;
        }

        throw new Error(`${context} failed: ${String(error)}`);
    }
}
