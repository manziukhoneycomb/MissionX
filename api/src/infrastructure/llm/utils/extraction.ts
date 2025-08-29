/**
 * Utilities for extracting SQL from model responses
 */

/**
 * Normalize SQL by removing extra newlines and whitespace
 */
export function normalizeSql(sql: string): string {
    if (!sql) return '';

    // Replace multiple spaces and tabs with a single space
    let normalized = sql.replace(/\s+/g, ' ');

    // Replace newlines with spaces
    normalized = normalized.replace(/\n+/g, ' ');

    // Trim whitespace at the beginning and end
    normalized = normalized.trim();

    // Ensure it ends with a semicolon
    if (!normalized.endsWith(';')) {
        normalized += ';';
    }

    return normalized;
}

/**
 * Extract SQL from text response if needed
 */
export function extractSqlFromContent(content: string): string | null {
    if (!content) return null;

    // Try to parse as JSON first (for structured responses)
    try {
        const jsonResponse: { sql: string } = JSON.parse(content) as { sql: string };
        if (jsonResponse && jsonResponse.sql) {
            // Found SQL in JSON response
            return normalizeSql(jsonResponse.sql);
        }
    } catch {
        // Not JSON, proceed with regular extraction methods
    }

    // Try to find SQL in code blocks
    const codeBlockMatch = content.match(/```(?:sql)?\s*(SELECT[\s\S]*?)```/i);
    if (codeBlockMatch && codeBlockMatch[1]) {
        return normalizeSql(codeBlockMatch[1].trim());
    }

    // Try to find SQL in inline code
    const inlineMatch = content.match(/`(SELECT[\s\S]*?)`/i);
    if (inlineMatch && inlineMatch[1]) {
        return normalizeSql(inlineMatch[1].trim());
    }

    // Try to find raw SQL
    const rawSqlMatch = content.match(/(SELECT[\s\S]*?FROM[\s\S]*?(?:;|\n|$))/i);
    if (rawSqlMatch && rawSqlMatch[1]) {
        return normalizeSql(rawSqlMatch[1].trim());
    }

    return null;
}
