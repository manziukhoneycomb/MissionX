import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Req,
    HttpCode,
    HttpStatus,
    UseGuards,
    ForbiddenException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBearerAuth,
    ApiBody,
    ApiNoContentResponse,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
} from '@nestjs/swagger';
import { InviteUserCommand } from '../commands/invite-user.command';
import { ResendInvitationCommand } from '../commands/resend-invitation.command';
import { CancelInvitationCommand } from '../commands/cancel-invitation.command';
import { CreateUserInvitationDto, UserInvitationDto } from '../dto/user-invitation.dto';
import { RoleName } from '../../domain/enums/role-name.enum';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';
import { 
    IUserInvitationRepository, 
    USER_INVITATION_REPOSITORY 
} from '../repositories/user-invitation.repository';
import { Inject } from '@nestjs/common';
import { UserInvitation } from '../../domain/entities/user-invitation.entity';

@ApiTags('User Invitations')
@ApiBearerAuth()
@Controller('tenant-admin/invitations')
@Authorize(RoleName.ADMIN)
export class UserInvitationsController {
    constructor(
        private readonly inviteUserCommand: InviteUserCommand,
        private readonly resendInvitationCommand: ResendInvitationCommand,
        private readonly cancelInvitationCommand: CancelInvitationCommand,
        @Inject(USER_INVITATION_REPOSITORY)
        private readonly invitationRepository: IUserInvitationRepository,
    ) {}

    private mapToDto(invitation: UserInvitation): UserInvitationDto {
        const dto = new UserInvitationDto();
        
        dto.id = invitation.id;
        dto.email = invitation.email;
        dto.firstName = invitation.firstName;
        dto.lastName = invitation.lastName;
        dto.status = invitation.status as any;
        dto.tenantId = invitation.tenantId;
        dto.invitedByUserId = invitation.invitedByUserId;
        dto.invitationToken = invitation.invitationToken;
        dto.acceptedByUserId = invitation.acceptedByUserId;
        dto.acceptedAt = invitation.acceptedAt;
        dto.message = invitation.message;
        dto.expiresAt = invitation.expiresAt;
        dto.createdAt = invitation.createdAt;
        dto.updatedAt = invitation.updatedAt;

        return dto;
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Invite a user to join the tenant',
        description: 'Creates and sends an invitation for a new user to join the tenant',
    })
    @ApiBody({ type: CreateUserInvitationDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'User invitation created successfully',
        type: UserInvitationDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role or missing tenant information' })
    async inviteUser(
        @Body() createInvitationDto: CreateUserInvitationDto,
        @Req() req: RequestWithTenant,
    ): Promise<UserInvitationDto> {
        const tenantId = req.tenantId;
        const userId = req.userId;

        if (!tenantId || !userId) {
            throw new ForbiddenException('Tenant and user information required to send invitations.');
        }

        return await this.inviteUserCommand.execute(createInvitationDto, tenantId, userId);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all invitations for tenant',
        description: 'Retrieves all invitations sent by the tenant',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of invitations retrieved successfully',
        type: [UserInvitationDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role or missing tenant information' })
    async findAllInvitations(@Req() req: RequestWithTenant): Promise<UserInvitationDto[]> {
        const tenantId = req.tenantId;

        if (!tenantId) {
            throw new ForbiddenException('Tenant ID is required to access invitations.');
        }

        const invitations = await this.invitationRepository.findAllByTenantId(tenantId);
        return invitations.map(invitation => this.mapToDto(invitation));
    }

    @Get('pending')
    @ApiOperation({
        summary: 'Get pending invitations for tenant',
        description: 'Retrieves all pending invitations sent by the tenant',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of pending invitations retrieved successfully',
        type: [UserInvitationDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin role or missing tenant information' })
    async findPendingInvitations(@Req() req: RequestWithTenant): Promise<UserInvitationDto[]> {
        const tenantId = req.tenantId;

        if (!tenantId) {
            throw new ForbiddenException('Tenant ID is required to access invitations.');
        }

        const invitations = await this.invitationRepository.findPendingByTenantId(tenantId);
        return invitations.map(invitation => this.mapToDto(invitation));
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get invitation by ID',
        description: 'Retrieves a specific invitation by ID within the tenant',
    })
    @ApiParam({
        name: 'id',
        description: 'Invitation ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Invitation retrieved successfully',
        type: UserInvitationDto,
    })
    @ApiNotFoundResponse({ description: 'Invitation not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - invitation not from same tenant' })
    async findInvitation(
        @Param('id') invitationId: string,
        @Req() req: RequestWithTenant,
    ): Promise<UserInvitationDto> {
        const tenantId = req.tenantId;

        if (!tenantId) {
            throw new ForbiddenException('Tenant ID is required to access invitation.');
        }

        const invitation = await this.invitationRepository.findById(invitationId);

        if (!invitation) {
            throw new ForbiddenException(`Invitation with ID ${invitationId} not found`);
        }

        if (invitation.tenantId !== tenantId) {
            throw new ForbiddenException('Access denied to invitation from different tenant');
        }

        return this.mapToDto(invitation);
    }

    @Patch(':id/resend')
    @ApiOperation({
        summary: 'Resend invitation',
        description: 'Resends a pending invitation to the user',
    })
    @ApiParam({
        name: 'id',
        description: 'Invitation ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Invitation resent successfully',
        type: UserInvitationDto,
    })
    @ApiNotFoundResponse({ description: 'Invitation not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - invitation not from same tenant or cannot be resent' })
    async resendInvitation(
        @Param('id') invitationId: string,
        @Req() req: RequestWithTenant,
    ): Promise<UserInvitationDto> {
        const tenantId = req.tenantId;

        if (!tenantId) {
            throw new ForbiddenException('Tenant ID is required to resend invitation.');
        }

        return await this.resendInvitationCommand.execute(invitationId, tenantId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Cancel invitation',
        description: 'Cancels a pending invitation',
    })
    @ApiParam({
        name: 'id',
        description: 'Invitation ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiNoContentResponse({ description: 'Invitation cancelled successfully' })
    @ApiNotFoundResponse({ description: 'Invitation not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - invitation not from same tenant or cannot be cancelled' })
    async cancelInvitation(
        @Param('id') invitationId: string,
        @Req() req: RequestWithTenant,
    ): Promise<void> {
        const tenantId = req.tenantId;

        if (!tenantId) {
            throw new ForbiddenException('Tenant ID is required to cancel invitation.');
        }

        await this.cancelInvitationCommand.execute(invitationId, tenantId);
    }
}