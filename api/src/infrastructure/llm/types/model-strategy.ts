/**
 * Types and interfaces for the model strategy pattern
 */

import { TableSchema } from '.';

/**
 * Result of SQL generation
 */
export interface SqlGenerationResult {
    readonly sql: string | null;
    readonly message: string;
}

/**
 * Result of formatting query results
 */
export interface FormattingResult {
    readonly text: string;
    readonly image?: string;
}

/**
 * Interface for SQL generation parameters
 */
export interface SqlGenerationParams {
    readonly question: string;
    readonly schemaInfo: Record<string, TableSchema>;
}

/**
 * Interface for result formatting parameters
 */
export interface ResultFormattingParams {
    readonly originalQuestion: string;
    readonly sql: string;
    readonly queryResult: unknown;
}

/**
 * Core interface for model strategy implementations
 */
export interface ModelStrategy {
    readonly name: string;
    generateSql(params: SqlGenerationParams): Promise<SqlGenerationResult>;
    formatResults(params: ResultFormattingParams): Promise<FormattingResult>;
}

/**
 * Configuration base for all model strategies
 */
export interface ModelConfig {
    readonly apiKey?: string;
    readonly apiUrl?: string;
    readonly temperature?: number;
}
