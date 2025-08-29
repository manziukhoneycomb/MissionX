import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AskAboutDataDto {
    @ApiProperty({
        description: 'The query to ask about data',
        example: 'Show me sales data for the last quarter',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    query: string;
}
