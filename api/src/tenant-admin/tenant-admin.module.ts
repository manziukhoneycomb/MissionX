import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { User } from '../domain/entities/user.entity';
import { UserInvitation } from '../domain/entities/user-invitation.entity';
import { Role } from '../domain/entities/role.entity';

// Controllers
import { TenantUsersController } from './controllers/tenant-users.controller';
import { UserInvitationsController } from './controllers/user-invitations.controller';

// Queries
import { GetTenantUsersQuery } from './queries/get-tenant-users.query';
import { GetTenantUserQuery } from './queries/get-tenant-user.query';

// Commands
import { InviteUserCommand } from './commands/invite-user.command';
import { ResendInvitationCommand } from './commands/resend-invitation.command';
import { CancelInvitationCommand } from './commands/cancel-invitation.command';
import { AssignRoleCommand } from './commands/assign-role.command';
import { RemoveRoleCommand } from './commands/remove-role.command';

// Repositories
import { 
    TenantUserRepository, 
    TENANT_USER_REPOSITORY, 
    ITenantUserRepository 
} from './repositories/tenant-user.repository';
import { 
    UserInvitationRepository, 
    USER_INVITATION_REPOSITORY, 
    IUserInvitationRepository 
} from './repositories/user-invitation.repository';

// Middleware
import { InvitationRateLimitMiddleware } from './middleware/invitation-rate-limit.middleware';

// Import existing application modules
import { UserModule } from '../application/users/user.module';
import { RolesModule } from '../application/roles/roles.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, UserInvitation, Role]),
        UserModule,
        RolesModule,
    ],
    controllers: [
        TenantUsersController,
        UserInvitationsController,
    ],
    providers: [
        // Queries
        GetTenantUsersQuery,
        GetTenantUserQuery,
        
        // Commands
        InviteUserCommand,
        ResendInvitationCommand,
        CancelInvitationCommand,
        AssignRoleCommand,
        RemoveRoleCommand,
        
        // Repositories
        {
            provide: TENANT_USER_REPOSITORY,
            useClass: TenantUserRepository,
        },
        {
            provide: USER_INVITATION_REPOSITORY,
            useClass: UserInvitationRepository,
        },
        
        // Middleware
        InvitationRateLimitMiddleware,
    ],
    exports: [
        TENANT_USER_REPOSITORY,
        USER_INVITATION_REPOSITORY,
        GetTenantUsersQuery,
        GetTenantUserQuery,
        InviteUserCommand,
        ResendInvitationCommand,
        CancelInvitationCommand,
        AssignRoleCommand,
        RemoveRoleCommand,
        InvitationRateLimitMiddleware,
    ],
})
export class TenantAdminModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(InvitationRateLimitMiddleware)
            .forRoutes(
                { path: 'tenant-admin/invitations', method: RequestMethod.POST },
                { path: 'tenant-admin/invitations/:id/resend', method: RequestMethod.PATCH }
            );
    }
}