import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserCommands } from './user.commands';
import { UserQueries } from './user.queries';
import { USER_COMMANDS } from './interfaces/user-commands.interface';
import { USER_QUERIES } from './interfaces/user-queries.interface';
import { ClerkInviteService } from '../../infrastructure/services/clerk-invite.service';
import { ClerkUserSignupService } from '../../infrastructure/services/clerk-user-signup.service';

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: USER_COMMANDS,
            useClass: UserCommands,
        },
        {
            provide: USER_QUERIES,
            useClass: UserQueries,
        },
        ClerkInviteService,
        ClerkUserSignupService,
    ],
    exports: [USER_COMMANDS, USER_QUERIES, ClerkInviteService, ClerkUserSignupService],
})
export class UserModule {}
