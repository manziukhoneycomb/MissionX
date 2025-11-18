import { ApiProperty } from '@nestjs/swagger';
import { TaskDto } from './task.dto';

export class TaskPaginationDto {
    @ApiProperty({
        description: 'List of tasks',
        type: [TaskDto],
    })
    tasks: TaskDto[];

    @ApiProperty({
        description: 'Total number of tasks',
        example: 100,
    })
    total: number;

    @ApiProperty({
        description: 'Current page number',
        example: 1,
    })
    page: number;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10,
    })
    limit: number;

    @ApiProperty({
        description: 'Total number of pages',
        example: 10,
    })
    totalPages: number;
}