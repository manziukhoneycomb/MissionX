import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationParamsDto {
    @ApiProperty({
        description: 'Page number (starts from 1)',
        example: 1,
        default: 1,
        required: false,
    })
    @IsInt()
    @Min(1)
    @IsOptional()
    @Type(() => Number)
    page?: number = 1;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10,
        default: 10,
        required: false,
    })
    @IsInt()
    @Min(1)
    @IsOptional()
    @Type(() => Number)
    limit?: number = 10;
}

export class PaginatedResponseDto<T> {
    @ApiProperty({
        description: 'Array of items for the current page',
    })
    items!: T[];

    @ApiProperty({
        description: 'Total number of items',
        example: 100,
    })
    total!: number;

    @ApiProperty({
        description: 'Current page number',
        example: 1,
    })
    page!: number;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10,
    })
    limit!: number;

    @ApiProperty({
        description: 'Total number of pages',
        example: 10,
    })
    totalPages!: number;
}
