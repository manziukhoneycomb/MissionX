import {
    Injectable,
    Inject,
    BadRequestException,
    InternalServerErrorException,
    Logger,
    ForbiddenException,
} from '@nestjs/common';
import { 
    IUserInvitationRepository, 
    USER_INVITATION_REPOSITORY 
} from '../repositories/user-invitation.repository';
import { IUserRepository, USER_REPOSITORY } from '../../application/repositories/user.repository.interface';
import { IRoleRepository, ROLE_REPOSITORY } from '../../application/repositories/role.repository.interface';
import { CreateUserInvitationDto, UserInvitationDto } from '../dto/user-invitation.dto';
import { RoleName } from '../../domain/enums/role-name.enum';
import { UserInvitation } from '../../domain/entities/user-invitation.entity';

@Injectable()
export class InviteUserCommand {
    private readonly logger = new Logger(InviteUserCommand.name);

    constructor(
        @Inject(USER_INVITATION_REPOSITORY)
        private readonly invitationRepository: IUserInvitationRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        @Inject(ROLE_REPOSITORY)
        private readonly roleRepository: IRoleRepository,
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

    async execute(
        dto: CreateUserInvitationDto,
        tenantId: string,
        invitedByUserId: string,
    ): Promise<UserInvitationDto> {
        this.logger.debug(`Inviting user ${dto.email} to tenant ${tenantId}`);

        // Validate that the user doesn't already exist
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) {
            throw new BadRequestException('User with this email already exists');
        }

        // Validate roles
        if (dto.roleIds && dto.roleIds.length > 0) {
            const roles = await this.roleRepository.findByIds(dto.roleIds);
            if (roles.length !== dto.roleIds.length) {
                throw new BadRequestException('One or more specified role IDs are invalid');
            }

            // Prevent inviting super admins (only super admins should be able to create other super admins)
            const roleNames = roles.map(role => role.name);
            if (roleNames.includes(RoleName.SUPER_ADMIN)) {
                throw new ForbiddenException('Cannot invite users with Super Admin role through tenant invitation');
            }
        }

        try {
            const invitation = await this.invitationRepository.create(dto, tenantId, invitedByUserId);
            
            this.logger.log(`Created invitation ${invitation.id} for ${dto.email} to tenant ${tenantId}`);
            
            return this.mapToDto(invitation);
        } catch (error: unknown) {
            this.logger.error(`Failed to create invitation for ${dto.email}:`, error);
            
            if (error instanceof BadRequestException) {
                throw error;
            }
            
            throw new InternalServerErrorException('Failed to create user invitation');
        }
    }
}