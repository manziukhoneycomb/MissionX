import { getMcpClient, getMcpResources, extractTextFromToolResult } from './mcp-client';
import { TableSchema, Column } from '../types';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
// Functions to extract and parse schema information
export function extractSchemaInfo(
    resources: { content: string; name: string }[],
): Record<string, TableSchema> {
    const tableSchemas: Record<string, TableSchema> = {};

    if (!Array.isArray(resources)) {
        console.warn('Resources is not an array when extracting schema info');
        return tableSchemas;
    }

    // First pass: gather all database schema resources
    for (const resource of resources) {
        try {
            if (typeof resource?.content !== 'string') {
                continue;
            }

            let parsedContent: {
                properties: Record<string, { type?: string; description?: string }>;
                required: string[];
            };
            try {
                parsedContent = JSON.parse(resource.content) as {
                    properties: Record<string, { type?: string; description?: string }>;
                    required: string[];
                };
            } catch {
                continue; // Not JSON content
            }

            // Resource names typically follow pattern: "postgres://localhost/<table>/schema"
            // or: "<table> database schema"
            const tableNameMatch =
                resource?.name?.match(/postgres:\/\/.*\/(.+)\/schema/) ||
                resource?.name?.match(/(.+) database schema/);

            if (tableNameMatch && tableNameMatch[1]) {
                const tableName = tableNameMatch[1].replace(/"|'/g, '').trim();

                if (tableName === 'public') {
                    continue; // Skip public schema resources that aren't table specific
                }

                // Extract columns from schema content
                const columns: Column[] = [];

                if (parsedContent.properties) {
                    for (const [columnName, columnProps] of Object.entries(
                        parsedContent.properties,
                    )) {
                        const colProps = columnProps;

                        columns.push({
                            name: columnName,
                            type: colProps.type || 'unknown',
                            nullable: !parsedContent.required?.includes(columnName),
                            description: colProps.description || '',
                        });
                    }
                }

                tableSchemas[tableName] = {
                    name: tableName,
                    columns,
                };
            }
        } catch (error) {
            console.error('Error processing schema resource:', error);
        }
    }

    // If no schemas were found, try to extract from manually querying information_schema
    if (Object.keys(tableSchemas).length === 0 && getMcpClient()) {
        console.log('No schemas found in resources, will try to query information_schema later');
    }

    return tableSchemas;
}

// Function to fetch database schema directly at startup
export async function fetchDatabaseSchema(mcpClient: Client): Promise<Record<string, TableSchema>> {
    if (!mcpClient) {
        console.warn('Cannot fetch database schema: MCP client not available');
        return {};
    }

    const tableSchemas: Record<string, TableSchema> = {};

    try {
        console.log('Fetching database schema from information_schema...');

        // Step 1: Get all tables in public schema
        const tablesResult = await mcpClient.callTool({
            name: 'query',
            arguments: {
                sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
            },
        });

        const tablesContent = extractTextFromToolResult(
            tablesResult as { content: { text: string }[] },
        );
        if (!tablesContent) {
            console.warn('No tables found in public schema');
            return tableSchemas;
        }

        let tables: { table_name: string }[] = [];
        try {
            tables = JSON.parse(tablesContent) as { table_name: string }[];
        } catch (e) {
            console.error('Error parsing tables result:', e);
            return tableSchemas;
        }

        console.log(`Found ${tables.length} tables in public schema`);

        // Step 2: For each table, get column information
        for (const table of tables) {
            const tableName = table.table_name;

            const columnsResult = await mcpClient.callTool({
                name: 'query',
                arguments: {
                    sql: `SELECT column_name, data_type, is_nullable, column_default, 
                character_maximum_length, numeric_precision, numeric_scale 
              FROM information_schema.columns 
              WHERE table_schema = 'public' AND table_name = '${tableName}'`,
                },
            });

            const columnsContent = extractTextFromToolResult(
                columnsResult as { content: { text: string }[] },
            );
            if (!columnsContent) {
                console.warn(`No columns found for table ${tableName}`);
                continue;
            }

            let columns: {
                column_name: string;
                data_type: string;
                is_nullable: string;
                column_default: string;
                character_maximum_length: string;
                numeric_precision: string;
            }[] = [];
            try {
                columns = JSON.parse(columnsContent) as {
                    column_name: string;
                    data_type: string;
                    is_nullable: string;
                    column_default: string;
                    character_maximum_length: string;
                    numeric_precision: string;
                }[];
            } catch (e) {
                console.error(`Error parsing columns for table ${tableName}:`, e);
                continue;
            }

            // Convert column information to our schema format
            const schemaColumns: Column[] = columns.map((col) => ({
                name: col.column_name,
                type: col.data_type,
                nullable: col.is_nullable === 'YES',
                description: `Default: ${col.column_default || 'NULL'}${
                    col.character_maximum_length
                        ? `, Max length: ${col.character_maximum_length}`
                        : ''
                }${col.numeric_precision ? `, Precision: ${col.numeric_precision}` : ''}`,
            }));

            tableSchemas[tableName] = {
                name: tableName,
                columns: schemaColumns,
            };

            console.log(
                `Fetched schema for table ${tableName} with ${schemaColumns.length} columns`,
            );
        }

        // Step 3: Discover table relationships by looking for foreign keys
        const foreignKeysResult = await mcpClient.callTool({
            name: 'query',
            arguments: {
                sql: `SELECT
              kcu.table_name as table_name,
              kcu.column_name as column_name,
              ccu.table_name AS foreign_table_name,
              ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
              AND tc.table_schema = 'public'`,
            },
        });

        const foreignKeysContent = extractTextFromToolResult(
            foreignKeysResult as { content: { text: string }[] },
        );
        if (foreignKeysContent) {
            try {
                const foreignKeys = JSON.parse(foreignKeysContent) as {
                    table_name: string;
                    column_name: string;
                    foreign_table_name: string;
                    foreign_column_name: string;
                }[];

                // Add relationship information to tables
                for (const fk of foreignKeys) {
                    const sourceTable = fk.table_name;
                    const sourceColumn = fk.column_name;
                    const targetTable = fk.foreign_table_name;
                    const targetColumn = fk.foreign_column_name;

                    if (tableSchemas[sourceTable]) {
                        // Add relationship information to column description
                        const column = tableSchemas[sourceTable].columns.find(
                            (c) => c.name === sourceColumn,
                        );
                        if (column) {
                            column.description += ` References ${targetTable}.${targetColumn}`;
                            column.foreignKey = {
                                table: targetTable,
                                column: targetColumn,
                            };
                        }
                    }
                }

                console.log(`Discovered ${foreignKeys.length} foreign key relationships`);
            } catch (e) {
                console.error('Error parsing foreign keys:', e);
            }
        }

        return tableSchemas;
    } catch (error) {
        console.error('Error fetching database schema:', error);
        return tableSchemas;
    }
}

// Function to initialize schema information from multiple sources
export async function initializeSchemaInfo(
    mcpClient: Client,
): Promise<Record<string, TableSchema>> {
    // First try to extract from MCP resources
    const schemaFromResources = extractSchemaInfo(
        getMcpResources() as { content: string; name: string }[],
    );

    if (Object.keys(schemaFromResources).length > 0) {
        console.log(
            `Found schema information for ${
                Object.keys(schemaFromResources).length
            } tables from MCP resources`,
        );
        return schemaFromResources;
    }

    // If no schema found in resources, fetch directly from database
    console.log('No schema found in MCP resources, fetching directly from database...');
    return await fetchDatabaseSchema(mcpClient);
}

// Format schema information for AI prompts
export function formatSchemaForPrompt(schemas: Record<string, TableSchema>): string {
    if (Object.keys(schemas).length === 0) {
        return 'No detailed schema information available.';
    }

    let schemaText = 'DATABASE SCHEMA INFORMATION:\n\n';

    // First list all tables and their columns
    for (const [tableName, tableSchema] of Object.entries(schemas)) {
        schemaText += `TABLE: ${tableName}\n`;
        schemaText += 'COLUMNS:\n';

        tableSchema.columns.forEach((column) => {
            const nullableText = column.nullable ? 'NULL' : 'NOT NULL';
            schemaText += `  - ${column.name} (${column.type.toUpperCase()}, ${nullableText})`;
            if (column.description) {
                schemaText += `: ${column.description}`;
            }
            schemaText += '\n';
        });

        schemaText += '\n';
    }

    // Then list relationships (for JOIN queries)
    schemaText += 'RELATIONSHIPS (for JOIN queries):\n';
    let hasRelationships = false;

    for (const [tableName, tableSchema] of Object.entries(schemas)) {
        const relatedColumns = tableSchema.columns.filter((col) => col.foreignKey);

        if (relatedColumns.length > 0) {
            hasRelationships = true;
            for (const column of relatedColumns) {
                if (column.foreignKey) {
                    schemaText += `- JOIN ${tableName} and ${column.foreignKey.table} using ${tableName}.${column.name} = ${column.foreignKey.table}.${column.foreignKey.column}\n`;
                }
            }
        }
    }

    if (!hasRelationships) {
        schemaText += '- No explicit foreign key relationships detected\n';
    }

    return schemaText;
}

// Validate SQL against schema
export function validateSqlAgainstSchema(
    sql: string,
    schemas: Record<string, TableSchema>,
): { isValid: boolean; error?: string } {
    if (!sql) {
        return { isValid: false, error: 'Empty SQL query' };
    }

    try {
        // Simple case-insensitive check for system tables
        const lowerSql = sql.toLowerCase();

        // Check for pg_* and information_schema tables
        if (lowerSql.includes('information_schema.') || lowerSql.includes('pg_')) {
            // Allow only specific information_schema tables we know exist
            const allowedSystemTables = [
                'information_schema.tables',
                'information_schema.columns',
                'information_schema.schemata',
                'information_schema.table_constraints',
                'information_schema.key_column_usage',
                'information_schema.constraint_column_usage',
            ];

            const isAllowedSystemTable = allowedSystemTables.some((table) =>
                lowerSql.includes(table.toLowerCase()),
            );

            if (!isAllowedSystemTable) {
                return {
                    isValid: false,
                    error: 'Only specific information_schema tables are allowed for system queries',
                };
            }
        } else {
            // For regular tables, check that they exist in our schema
            const tableNames = Object.keys(schemas).map((name) => name.toLowerCase());

            // Basic column name validation to catch potential case sensitivity issues
            const columnValidationResult = validateColumnNames(sql, schemas);
            if (!columnValidationResult.isValid) {
                return columnValidationResult;
            }

            // Check if JOIN query
            const isJoinQuery = lowerSql.includes(' join ');

            if (isJoinQuery) {
                // For JOIN queries, check that all referenced tables exist
                const hasAllKnownTables = tableNames.some(
                    (tableName) =>
                        lowerSql.includes(`public.${tableName}`) ||
                        lowerSql.includes(` ${tableName} `) ||
                        lowerSql.includes(` ${tableName}\n`),
                );

                if (!hasAllKnownTables && tableNames.length > 0) {
                    return {
                        isValid: false,
                        error: `JOIN query must use tables that exist in the schema`,
                    };
                }
            } else {
                // For non-JOIN queries, simple check if any known table is referenced
                const hasKnownTable = tableNames.some(
                    (tableName) =>
                        lowerSql.includes(`public.${tableName}`) ||
                        lowerSql.includes(` ${tableName} `) ||
                        lowerSql.includes(` ${tableName},`) ||
                        lowerSql.includes(`(${tableName})`) ||
                        lowerSql.includes(`from ${tableName}`) ||
                        lowerSql.endsWith(` ${tableName};`) ||
                        lowerSql.endsWith(` ${tableName}`),
                );

                if (!hasKnownTable && tableNames.length > 0) {
                    return {
                        isValid: false,
                        error: `Query must use one of the known tables: ${tableNames.join(', ')}`,
                    };
                }
            }
        }

        return { isValid: true };
    } catch (error) {
        return { isValid: false, error: `SQL validation error: ${error}` };
    }
}

// Helper function to validate column names in SQL query
function validateColumnNames(
    sql: string,
    schemas: Record<string, TableSchema>,
): { isValid: boolean; error?: string } {
    try {
        // Extract all potential column references (this is a simple approach, not a full SQL parser)
        const columnReferences = extractColumnReferences(sql);

        if (columnReferences.length === 0) {
            return { isValid: true }; // No column references to validate
        }

        // For each potential column reference, check if it exists in the schema
        for (const colRef of columnReferences) {
            const [tableName, columnName] = colRef.includes('.')
                ? colRef.split('.')
                : [null, colRef];

            if (tableName === null) {
                // Skip unqualified column names - they're harder to validate without context
                continue;
            }

            // Clean up table name (remove "public." prefix if present)
            const cleanTableName = tableName.replace(/^public\./, '').toLowerCase();

            // Check if the table exists in our schema
            const schemaKeys = Object.keys(schemas).map((k) => k.toLowerCase());
            const matchingTableKey = schemaKeys.find((k) => k === cleanTableName);

            if (!matchingTableKey) {
                continue; // Skip if we can't find the table
            }

            // Get the proper case for the table name
            const properTableName = Object.keys(schemas).find(
                (k) => k.toLowerCase() === matchingTableKey,
            );

            if (!properTableName) {
                continue;
            }

            // Get the schema for this table
            const tableSchema = schemas[properTableName];

            // Check if the column exists in the table schema (case-insensitive comparison)
            const columnExists = tableSchema.columns.some(
                (col) => col.name.toLowerCase() === columnName.toLowerCase(),
            );

            if (!columnExists) {
                // Get the actual column names for better error messages
                const actualColumns = tableSchema.columns.map((col) => col.name);

                // Check if this might be a case sensitivity issue
                const similarColumn = tableSchema.columns.find(
                    (col) => col.name.toLowerCase() === columnName.toLowerCase(),
                );

                if (similarColumn) {
                    return {
                        isValid: false,
                        error: `Column case mismatch: "${columnName}" should be "${similarColumn.name}" in table "${properTableName}"`,
                    };
                }

                return {
                    isValid: false,
                    error: `Column "${columnName}" does not exist in table "${properTableName}". Available columns are: ${actualColumns.join(
                        ', ',
                    )}`,
                };
            }
        }

        return { isValid: true };
    } catch (error) {
        console.error('Error validating column names:', error);
        return { isValid: true }; // Allow query to proceed even if our validation fails
    }
}

// Helper function to extract column references from SQL
function extractColumnReferences(sql: string): string[] {
    // This is a simplified approach - not a full SQL parser
    const references: string[] = [];

    // Extract qualified column references (table.column)
    const qualifiedColRegex = /(\w+)\.(\w+)/g;
    let match: RegExpExecArray | null;

    while ((match = qualifiedColRegex.exec(sql)) !== null) {
        references.push(`${match[1]}.${match[2]}`);
    }

    return references;
}
