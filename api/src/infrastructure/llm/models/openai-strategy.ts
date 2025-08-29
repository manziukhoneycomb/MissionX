import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources';
import { BaseModelStrategy } from './base-model-strategy';
import {
    FormattingResult,
    ModelConfig,
    ResultFormattingParams,
    SqlGenerationParams,
    SqlGenerationResult,
} from '../types/model-strategy';
import { formatSchemaForPrompt } from '../utils/schema';
import { extractSqlFromContent } from '../utils/extraction';
import { STATIC_DB_RULES } from '../config';

/**
 * OpenAI-specific configuration options
 */
export interface OpenAIConfig extends ModelConfig {
    readonly model: string;
    readonly imageGenerationModel: string;
}

/**
 * OpenAI model strategy implementation
 */
export class OpenAIStrategy extends BaseModelStrategy {
    private readonly model: string;
    private readonly imageGenerationModel: string;
    private readonly openai: OpenAI;

    constructor(config: OpenAIConfig) {
        super('openai', config);
        this.model = config.model || 'gpt-4o';
        this.imageGenerationModel = config.imageGenerationModel || 'dall-e-3';
        // Initialize OpenAI client
        this.openai = new OpenAI({
            apiKey: this.config.apiKey,
        });
    }

    /**
     * Validate OpenAI-specific configuration
     */
    public override validateConfig(): boolean {
        return Boolean(this.config.apiKey);
    }

    /**
     * Generate SQL using OpenAI API
     */
    public async generateSql(params: SqlGenerationParams): Promise<SqlGenerationResult> {
        if (!this.validateConfig()) {
            throw new Error('OpenAI API key is not set');
        }

        try {
            const formattedSchemaInfo = formatSchemaForPrompt(params.schemaInfo);

            // Create properly typed messages array
            const messages: ChatCompletionMessageParam[] = [
                {
                    role: 'system',
                    content: `You are a PostgreSQL expert that converts natural language to SQL.
Follow these rules:
- Always get id from the database. Add it to each SELECT query. ("id" - column)
- Always add a " before and after the column name. Example: 'SELECT table1."col1" FROM table1'
- Analyze the question and schema word by word
- Use table aliases to prevent ambiguity. Example: 'SELECT t1."col1", t2."col1" FROM table1 t1 JOIN table2 t2 ON t1."id" = t2."id"'
- When creating a ratio, always cast the numerator as float
- Always include the SQL in a code block
- If user asks not existing column, try to guess the closest match
- Output JSON with a single field "sql" containing the query
- If the SQL cannot be generated, DO NOT return sql object, return error object with message
- ${STATIC_DB_RULES}
Database schema:
${formattedSchemaInfo}`,
                },
                {
                    role: 'user',
                    content: params.question,
                },
            ];

            console.log('OpenAI messages:', messages);

            // Call the OpenAI API
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: messages,
                temperature: this.config.temperature || 0.1,
                response_format: { type: 'json_object' },
            });

            // Extract content from the response
            const assistantMessage = response.choices[0]?.message.content || '';
            console.log('OpenAI raw response:', assistantMessage);

            // Extract SQL from content
            let extractedSql: string | null = null;
            try {
                const jsonResponse: { sql: string } = JSON.parse(assistantMessage) as {
                    sql: string;
                };
                if (jsonResponse && jsonResponse.sql) {
                    extractedSql = jsonResponse.sql
                        .replace(/\\"/g, '"')
                        .replace('```sql', '')
                        .replace('```', '');
                }
            } catch {
                // Not valid JSON or no sql field, use the regular extractor
                extractedSql = extractSqlFromContent(assistantMessage);
            }

            return {
                sql: extractedSql,
                message: assistantMessage,
            };
        } catch (error) {
            return this.handleApiError(error, 'SQL generation with OpenAI');
        }
    }

    /**
     * Format query results using OpenAI API
     */
    public async formatResults(params: ResultFormattingParams): Promise<FormattingResult> {
        if (!this.validateConfig()) {
            throw new Error('OpenAI API key is not set');
        }

        const needsVisualization = this.isVisualizationRequest(params.originalQuestion);

        if (needsVisualization) {
            return this.formatResultsWithVisualization(
                params.originalQuestion,
                params.sql,
                params.queryResult,
            );
        } else {
            return this.formatTextOnlyResults(
                params.originalQuestion,
                params.sql,
                params.queryResult,
            );
        }
    }

    /**
     * Check if the question is asking for a chart/visualization
     */
    private isVisualizationRequest(question: string): boolean {
        const visualizationKeywords = [
            'chart',
            'graph',
            'plot',
            'visualize',
            'visualization',
            'bar chart',
            'pie chart',
            'line graph',
            'histogram',
            'scatter plot',
            'draw',
            'create a chart',
            'visually',
            'trend',
        ];

        const lowerQuestion = question.toLowerCase();
        return visualizationKeywords.some((keyword) => lowerQuestion.includes(keyword));
    }

    /**
     * Helper function for text-only responses
     */
    private async formatTextOnlyResults(
        originalQuestion: string,
        sql: string,
        queryResult: unknown,
    ): Promise<FormattingResult> {
        // Create properly typed messages array
        const messages: ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content: `You are a data analyst expert at explaining database query results in simple terms.
Provide concise, human-readable explanations of SQL query results.
Include only the essential information that answers the user's question directly.`,
            },
            {
                role: 'user',
                content: `
Original question: ${originalQuestion}
SQL query executed: ${sql}
Query results: ${JSON.stringify(queryResult, null, 2)}

Explain these results in a clear, informative way that directly answers the original question.
Format the response in plain text that directly answers the user's question.
Include relevant numbers, summaries, or insights from the data.
Do not mention the SQL query or technical details unless specifically relevant to the answer.
Format your response in valid html.
Whenever you mention a invoice vendor name wrap it in a span like this:
<span class="db-object" data-id="\${id}">\${name}</span>
Here, \${id} should be replaced with the corresponding INVOICE  id.
Focus only on the most important insights from the data.`,
            },
        ];

        try {
            // Use the OpenAI client
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: messages,
                temperature: this.config.temperature || 0.3,
            });

            const formattedResponse = response.choices[0]?.message.content || '';
            return { text: formattedResponse };
        } catch (error) {
            return this.handleApiError(error, 'Result formatting with OpenAI');
        }
    }

    /**
     * Function specifically for generating visualizations
     */
    private async formatResultsWithVisualization(
        originalQuestion: string,
        sql: string,
        queryResult: unknown,
    ): Promise<FormattingResult> {
        // First get a text explanation
        const textResult = await this.formatTextOnlyResults(originalQuestion, sql, queryResult);

        // Then generate an image based on the data
        const promptContent = `Create a visualization for the following data:
Question: ${originalQuestion}
Data: ${JSON.stringify(queryResult, null, 2)}
Choose the most appropriate chart type to represent this data effectively.
Make sure the visualization is clear, professional, and directly answers the question.`;

        try {
            // Use the OpenAI client for image generation
            const imageResponse = await this.openai.images.generate({
                model: this.imageGenerationModel,
                prompt: promptContent,
                n: 1,
                size: '1024x1024',
                quality: 'medium',
            });

            // Get the image data
            const imageData = imageResponse.data?.[0]?.b64_json;

            if (imageData) {
                // Return both text and image
                return {
                    text: textResult.text,
                    image: `data:image/png;base64,${imageData}`,
                };
            }

            // Fall back to text-only if image generation failed
            return textResult;
        } catch (error) {
            console.error('Error with visualization, falling back to text-only', error);
            return textResult;
        }
    }
}
