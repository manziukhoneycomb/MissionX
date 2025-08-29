import { ApiProperty } from '@nestjs/swagger';

export class AskAboutDataResponseDto {
    @ApiProperty({
        description: 'The formatted response to the query',
    })
    response: string;

    @ApiProperty({
        description: 'The generated SQL query',
        required: false,
    })
    sql?: string;

    @ApiProperty({
        description: 'Raw query result data',
        required: false,
    })
    rawResult?: unknown;

    @ApiProperty({
        description: 'Base64 encoded image if generated',
        required: false,
    })
    image?: string;

    @ApiProperty({
        description: 'Error message if query execution failed',
        required: false,
    })
    error?: string;
}
