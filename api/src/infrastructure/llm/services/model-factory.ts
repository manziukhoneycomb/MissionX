import { ModelStrategy } from '../types/model-strategy';
import { OpenAIConfig, OpenAIStrategy } from '../models/openai-strategy';

/**
 * Supported model types
 */
export type ModelType = 'gemini' | 'ollama' | 'openai';

/**
 * Factory for creating model strategies
 */
export class ModelFactory {
    private static readonly strategies = new Map<string, ModelStrategy>();

    /**
     * Get a strategy instance for the specified model type
     */
    public static getStrategy(
        type: ModelType,
        config: OpenAIConfig | { [key: string]: unknown },
    ): ModelStrategy {
        // Check if we already have an instance of this strategy
        const existingStrategy = this.strategies.get(type);
        if (existingStrategy) {
            return existingStrategy;
        }

        // Create a new strategy instance
        let strategy: ModelStrategy;

        switch (type) {
            case 'openai':
                strategy = new OpenAIStrategy(config as OpenAIConfig);
                break;
            default:
                throw new Error(`Unsupported model type: ${type}`);
        }

        // Cache the strategy for future use
        this.strategies.set(type, strategy);
        return strategy;
    }

    /**
     * Clear all cached strategies
     */
    public static clearStrategies(): void {
        this.strategies.clear();
    }
}
