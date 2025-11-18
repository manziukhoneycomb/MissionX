import {
    Controller,
    Post,
    Body,
    Req,
    HttpCode,
    HttpStatus,
    Inject,
    ForbiddenException,
} from '@nestjs/common';

import {
    IUserCommands,
    USER_COMMANDS,
} from '../../application/users/interfaces/user-commands.interface';
import { CreateUserDto } from '../../application/users/dto/create-user.dto';
import { UserDto } from '../../application/users/dto/user.dto';
import { RoleName } from '../../domain/enums/role-name.enum';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RequestWithTenant } from 'src/infrastructure/middleware/request-with-tenant.interface';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiBody,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
} from '@nestjs/swagger';

export interface InviteUserDto {
    email: string;
    firstName?: string;
    lastName?: string;
    roleIds: string[];
    sendWelcomeEmail: boolean;
}

@ApiTags('Tenant Admin')
@ApiBearerAuth()
@Controller('tenant-admin')
@Authorize(RoleName.ADMIN)
export class TenantAdminController {
    constructor(
        @Inject(USER_COMMANDS) private readonly userCommands: IUserCommands,
    ) {}

    @Post('invite-user')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Invite a user to the tenant',
        description: 'Sends an invitation to a user to join the current tenant',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', format: 'email' },
                firstName: { type: 'string', required: false },
                lastName: { type: 'string', required: false },
                roleIds: { type: 'array', items: { type: 'string' } },
                sendWelcomeEmail: { type: 'boolean' },
            },
            required: ['email', 'roleIds', 'sendWelcomeEmail'],
        },
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'User invitation sent successfully',
        type: UserDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({
        description: 'Forbidden - requires admin role or missing tenant information',
    })
    async inviteUser(
        @Body() inviteUserDto: InviteUserDto,
        @Req() req: RequestWithTenant,
    ): Promise<{ message: string; invitationId?: string }> {
        const tenantId = req.tenantId;

        if (tenantId === undefined) {
            throw new ForbiddenException('Admin user must belong to a tenant.');
        }

        // For now, this is a placeholder implementation
        // In a real implementation, this would:
        // 1. Create a user record with invited status
        // 2. Generate an invitation token
        // 3. Send an email invitation using Clerk or custom email service
        // 4. Return the invitation details

        // Mock implementation for demonstration
        const createUserDto: CreateUserDto = {
            email: inviteUserDto.email,
            firstName: inviteUserDto.firstName,
            lastName: inviteUserDto.lastName,
            roleIds: inviteUserDto.roleIds,
        };

        try {
            const user = await this.userCommands.createUser(createUserDto, tenantId);
            
            // TODO: Implement actual invitation logic here
            // - Generate invitation token
            // - Send email invitation
            // - Set user status to 'invited'
            
            if (inviteUserDto.sendWelcomeEmail) {
                // TODO: Send welcome email
                console.log(`Sending welcome email to ${inviteUserDto.email}`);
            }

            return {
                message: 'User invitation sent successfully',
                invitationId: `inv_${Date.now()}`, // Mock invitation ID
            };
        } catch (error) {
            throw new ForbiddenException('Failed to invite user: ' + error.message);
        }
    }
}