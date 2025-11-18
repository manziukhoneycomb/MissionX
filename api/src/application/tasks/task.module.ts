import { Module } from '@nestjs/common';
import { TaskCommands } from './task.commands';
import { TaskQueries } from './task.queries';
import { TASK_COMMANDS } from './interfaces/task-commands.interface';
import { TASK_QUERIES } from './interfaces/task-queries.interface';

@Module({
    providers: [
        {
            provide: TASK_COMMANDS,
            useClass: TaskCommands,
        },
        {
            provide: TASK_QUERIES,
            useClass: TaskQueries,
        },
    ],
    exports: [TASK_COMMANDS, TASK_QUERIES],
})
export class TaskModule {}