import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { MCP_SERVER_COMMAND, getMcpServerArgs } from '../config';

// Global variables
let mcpClient: Client | null = null;
let mcpTools: unknown[] = [];
let mcpResources: unknown[] = [];

// Function to safely access content from MCP tool results
export function extractTextFromToolResult(result: { content: { text: string }[] }): string {
    if (
        !result ||
        !result.content ||
        !Array.isArray(result.content) ||
        result.content.length === 0
    ) {
        return '';
    }

    const firstContent = result.content[0];
    return firstContent && typeof firstContent.text === 'string' ? firstContent.text : '';
}

// Function to initialize MCP client
export async function initializeMcpClient(): Promise<void> {
    // Get MCP server args dynamically using the config function
    const mcpServerArgs = getMcpServerArgs();

    console.log(
        `Initializing MCP client transport for command: ${MCP_SERVER_COMMAND} ${mcpServerArgs.join(
            ' ',
        )}`,
    );
    try {
        const transport = new StdioClientTransport({
            command: MCP_SERVER_COMMAND,
            args: mcpServerArgs as string[],
        });

        mcpClient = new Client({
            name: 'backend-mcp-llm-client',
            version: '1.0.0',
        });

        await mcpClient.connect(transport);
        console.log('MCP Client connected successfully via StdioClientTransport.');

        const toolsResponse = await mcpClient.listTools();
        mcpTools = (toolsResponse as { tools: unknown[] })?.tools || [];

        const resourcesResponse = await mcpClient.listResources();
        mcpResources = (resourcesResponse as { resources: unknown[] })?.resources || [];

        const toolCount = Array.isArray(mcpTools) ? mcpTools.length : 0;
        const resourceCount = Array.isArray(mcpResources) ? mcpResources.length : 0;
        console.log(`Discovered ${toolCount} MCP tools and ${resourceCount} resources.`);
    } catch (error: unknown) {
        console.error('Error initializing MCP Client:', error);
        mcpClient = null;
    }
}

// Getter for mcpClient
export function getMcpClient(): Client | null {
    return mcpClient;
}

// Getter for mcpTools
export function getMcpTools(): unknown[] {
    return mcpTools;
}

// Getter for mcpResources
export function getMcpResources(): unknown[] {
    return mcpResources;
}

// Format Ollama tools
export function formatToolsForOllama(
    tools: {
        description: string;
        input_schema: {
            properties: Record<string, { type?: string; description?: string }>;
            required: string[];
        };
        name: string;
    }[],
): unknown[] {
    return tools.map((tool) => {
        const properties: Record<string, { type: string; description: string }> = {};
        let toolDescription = tool?.description || `Executes the ${tool?.name || 'unknown'} tool.`;
        const toolName = tool?.name;

        // Add specific instructions for the 'query' tool
        if (toolName === 'query') {
            toolDescription =
                "Executes a read-only SQL query against the PostgreSQL database. The SQL query string MUST be provided in the 'sql' argument.";
        }

        if (tool?.input_schema?.properties) {
            for (const [key, value] of Object.entries(tool.input_schema.properties)) {
                const propSchema = value as { type?: string; description?: string };
                let jsonSchemaType: string = 'string';
                let paramDescription = propSchema?.description || `Parameter ${key}`;

                // Add specific description for the 'sql' argument of the 'query' tool
                if (toolName === 'query' && key === 'sql') {
                    paramDescription = 'The exact, read-only SQL query string to execute.';
                }

                if (typeof propSchema?.type === 'string') {
                    switch (propSchema.type.toLowerCase()) {
                        case 'string':
                        case 'text':
                            jsonSchemaType = 'string';
                            break;
                        case 'integer':
                        case 'int':
                        case 'number':
                            jsonSchemaType = 'integer';
                            break;
                        case 'boolean':
                        case 'bool':
                            jsonSchemaType = 'boolean';
                            break;
                        default:
                            jsonSchemaType = 'string';
                    }
                }
                properties[key] = {
                    type: jsonSchemaType,
                    description: paramDescription,
                };
            }
        }
        return {
            type: 'function',
            function: {
                name: toolName || 'unknown_tool',
                description: toolDescription,
                parameters: {
                    type: 'object',
                    properties: properties,
                    required: tool?.input_schema?.required || [],
                },
            },
        };
    });
}

// Call MCP tool with validations
export async function callMcpTool(
    toolName: string,
    args: Record<string, unknown>,
): Promise<unknown> {
    if (!mcpClient) {
        throw new Error('MCP Client not available');
    }

    const tool = mcpTools.find((t: { name: string }) => t.name === toolName);
    if (!tool) {
        throw new Error(`Tool '${toolName}' not found`);
    }

    return await mcpClient.callTool({
        name: toolName,
        arguments: args,
    });
}
