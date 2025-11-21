import { Module } from '@nestjs/common';
import { UserCommands } from './user.commands';
import { UserQueries } from './user.queries';
import { InvitationCommands } from './invitation.commands';
import { InvitationQueries } from './invitation.queries';
import { USER_COMMANDS } from './interfaces/user-commands.interface';
import { USER_QUERIES } from './interfaces/user-queries.interface';
import { INVITATION_COMMANDS } from './interfaces/invitation-commands.interface';
import { INVITATION_QUERIES } from './interfaces/invitation-queries.interface';

@Module({
    providers: [
        {
            provide: USER_COMMANDS,
            useClass: UserCommands,
        },
        {
            provide: USER_QUERIES,
            useClass: UserQueries,
        },
        {
            provide: INVITATION_COMMANDS,
            useClass: InvitationCommands,
        },
        {
            provide: INVITATION_QUERIES,
            useClass: InvitationQueries,
        },
    ],
    exports: [USER_COMMANDS, USER_QUERIES, INVITATION_COMMANDS, INVITATION_QUERIES],
})
export class UserModule {}
