import { Module } from '@nestjs/common';
import { UserCommands } from './user.commands';
import { UserQueries } from './user.queries';
import { ClerkInviteService } from './services/clerk-invite.service';
import { InvitationAcceptanceService } from './services/invitation-acceptance.service';
import { USER_COMMANDS } from './interfaces/user-commands.interface';
import { USER_QUERIES } from './interfaces/user-queries.interface';

@Module({
    providers: [
        ClerkInviteService,
        InvitationAcceptanceService,
        {
            provide: USER_COMMANDS,
            useClass: UserCommands,
        },
        {
            provide: USER_QUERIES,
            useClass: UserQueries,
        },
    ],
    exports: [USER_COMMANDS, USER_QUERIES, ClerkInviteService, InvitationAcceptanceService],
})
export class UserModule {}
