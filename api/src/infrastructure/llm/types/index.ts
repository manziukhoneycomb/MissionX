/**
 * Custom error interface with optional status code for HTTP responses
 */
export interface AppError extends Error {
    statusCode?: number;
}

/**
 * Interface for query request body in API endpoints
 */
export interface AskRequestBody {
    query: string;
}

/**
 * Interface for Ollama API message format
 */
export interface OllamaMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    tool_calls?: OllamaToolCall[];
    tool_call_id?: string;
}

/**
 * Interface for Ollama API tool call format
 */
export interface OllamaToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string | Record<string, unknown>;
    };
}

/**
 * Interface for database column metadata
 */
export interface Column {
    name: string;
    type: string;
    nullable: boolean;
    description: string;
    foreignKey?: {
        table: string;
        column: string;
    };
}

/**
 * Interface for database table schema metadata
 */
export interface TableSchema {
    name: string;
    columns: Column[];
}
