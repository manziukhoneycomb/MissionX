import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { MCP_SERVER_COMMAND, getMcpServerArgs } from '../config';

@Injectable()
export class McpService implements OnModuleInit {
    private readonly logger = new Logger(McpService.name);
    private mcpClient: Client | null = null;
    private mcpTools: unknown[] = [];
    private mcpResources: unknown[] = [];

    async onModuleInit(): Promise<void> {
        await this.initializeMcpClient();
        this.logger.log('MCP Client initialized');
    }

    // Function to initialize MCP client
    private async initializeMcpClient(): Promise<void> {
        // Get MCP server args dynamically using the config function
        const mcpServerArgs = getMcpServerArgs();

        this.logger.log(
            `Initializing MCP client transport for command: ${MCP_SERVER_COMMAND} ${mcpServerArgs.join(
                ' ',
            )}`,
        );

        try {
            const transport = new StdioClientTransport({
                command: MCP_SERVER_COMMAND,
                args: mcpServerArgs as string[],
            });

            this.mcpClient = new Client({
                name: 'backend-mcp-llm-client',
                version: '1.0.0',
            });

            await this.mcpClient.connect(transport);
            this.logger.log('MCP Client connected successfully via StdioClientTransport.');

            const toolsResponse = await this.mcpClient.listTools();
            this.mcpTools = (toolsResponse as { tools: unknown[] })?.tools || [];

            const resourcesResponse = await this.mcpClient.listResources();
            this.mcpResources = (resourcesResponse as { resources: unknown[] })?.resources || [];

            const toolCount = Array.isArray(this.mcpTools) ? this.mcpTools.length : 0;
            const resourceCount = Array.isArray(this.mcpResources) ? this.mcpResources.length : 0;
            this.logger.log(`Discovered ${toolCount} MCP tools and ${resourceCount} resources.`);

            // Store schema information in global for backward compatibility
            this.initializeSchemaInfo();
        } catch (error: unknown) {
            this.logger.error('Error initializing MCP Client:', error);
            this.mcpClient = null;
        }
    }

    private initializeSchemaInfo(): Record<string, unknown> {
        return {};
    }

    // Get MCP client instance
    getClient(): Client | null {
        return this.mcpClient;
    }

    // Get MCP tools
    getTools(): unknown[] {
        return this.mcpTools;
    }

    // Get MCP resources
    getResources(): unknown[] {
        return this.mcpResources;
    }

    // Call MCP tool with validations
    async callMcpTool(toolName: string, args: unknown): Promise<unknown> {
        if (!this.mcpClient) {
            throw new Error('MCP Client not available');
        }

        const tool = this.mcpTools.find((t: { name: string }) => t.name === toolName);
        if (!tool) {
            throw new Error(`Tool '${toolName}' not found`);
        }

        return await this.mcpClient.callTool({
            name: toolName,
            arguments: args as { [x: string]: unknown },
        });
    }

    // Function to safely access content from MCP tool results
    extractTextFromToolResult(result: { content: { text: string }[] }): string {
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

    // Format Ollama tools
    formatToolsForOllama(
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
            let toolDescription =
                tool?.description || `Executes the ${tool?.name || 'unknown'} tool.`;
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
}
