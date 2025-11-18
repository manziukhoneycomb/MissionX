import { Module } from '@nestjs/common';
import { TeamGuard } from './guards/team.guard';
import { TeamMiddleware } from '../middleware/team.middleware';

@Module({
    providers: [
        TeamGuard,
        TeamMiddleware,
    ],
    exports: [
        TeamGuard,
        TeamMiddleware,
    ],
})
export class TeamAuthModule {}