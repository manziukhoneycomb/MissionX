export const MAX_SQL_GENERATION_ATTEMPTS: number = parseInt(
    process.env.MAX_SQL_GENERATION_ATTEMPTS || '3',
    10,
);

// LLM Provider selection
export type ModelProvider = 'ollama' | 'gemini' | 'openai';

export const SELECTED_MODEL_PROVIDER: ModelProvider =
    (process.env.SELECTED_MODEL_PROVIDER as ModelProvider) || 'openai';

// Ollama configuration
export const OLLAMA_API_BASE_URL: string =
    process.env.OLLAMA_API_BASE_URL || 'http://localhost:11434';
export const OLLAMA_REQUEST_MODEL: string = process.env.OLLAMA_REQUEST_MODEL || 'phi4';

// Google Gemini configuration
export const GEMINI_API_KEY: string = process.env.GEMINI_API_KEY || '';
export const GEMINI_API_URL: string =
    process.env.GEMINI_API_URL ||
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent';

// Updated image generation URL for the Gemini model that supports image generation
export const GEMINI_IMAGE_GENERATION_API_URL: string =
    process.env.GEMINI_IMAGE_GENERATION_API_URL ||
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent';

// OpenAI configuration
export const OPENAI_API_KEY: string = process.env.OPENAI_API_KEY || '';
export const OPENAI_MODEL: string = process.env.OPENAI_MODEL || 'gpt-4o';
export const OPENAI_IMAGE_GENERATION_MODEL: string =
    process.env.OPENAI_IMAGE_GENERATION_MODEL || 'gpt-image-1';

// MCP configuration
export const MCP_SERVER_COMMAND: string = process.env.MCP_SERVER_COMMAND || 'npx';

// Database configuration for MCP - uses the same DB config as TypeORM
export const getMcpConnectionString = (): string => {
    const host = process.env.DB_HOST || 'db';
    const port = process.env.DB_PORT || '5432';
    const username = process.env.DB_USERNAME || 'postgres';
    const password = process.env.DB_PASSWORD || 'postgres';
    const database = process.env.DB_DATABASE || 'postgres';
    const ssl = process.env.DB_SSL === 'true' ? '?sslmode=require' : '';

    return `postgresql://${username}:${password}@${host}:${port}/${database}${ssl}`;
};

// MCP server arguments with configurable connection string
export const getMcpServerArgs = (): ReadonlyArray<string> => {
    const connectionString = process.env.MCP_CONNECTION_STRING || getMcpConnectionString();
    return ['-y', '@modelcontextprotocol/server-postgres', connectionString];
};

export const STATIC_DB_RULES = `
- If user asks for supplier, it means vendor in the database
- eveything mentioned as supplier, parts, etc is related to invoices and invoices items
- If you work with invoices, you should always get id from the invoice table. Add it to each SELECT query. ("id" - column)
`;
