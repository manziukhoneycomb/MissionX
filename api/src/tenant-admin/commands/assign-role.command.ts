import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../application/repositories/user.repository.interface';
import { IRoleRepository, ROLE_REPOSITORY } from '../../application/repositories/role.repository.interface';
import { AssignRoleDto } from '../dto/user-role.dto';
import { TenantUserDto } from '../dto/tenant-user.dto';
import { RoleName } from '../../domain/enums/role-name.enum';
import { User } from '../../domain/entities/user.entity';
import { RoleDto } from '../../application/roles/dto/role.dto';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { extractErrorInfo } from '../../domain/utils/error.utils';

@Injectable()
export class AssignRoleCommand {
    private readonly logger = new Logger(AssignRoleCommand.name);

    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        @Inject(ROLE_REPOSITORY)
        private readonly roleRepository: IRoleRepository,
    ) {}

    private mapToTenantUserDto(user: User): TenantUserDto {
        const dto = new TenantUserDto();

        dto.id = user.id;
        dto.email = user.email;
        dto.subId = user.subId;
        dto.firstName = user.firstName;
        dto.lastName = user.lastName;
        dto.createdAt = user.createdAt;
        dto.updatedAt = user.updatedAt;
        dto.isActive = user.isActive;

        if (user.tenant) {
            dto.tenant = { id: user.tenant.id, name: user.tenant.name };
        }

        if (user.roles) {
            dto.roles = user.roles.map((role) => {
                const roleDto = new RoleDto();
                roleDto.id = role.id;
                roleDto.name = role.name;
                return roleDto;
            });
        } else {
            dto.roles = [];
        }

        dto.hasAcceptedInvitation = !!user.subId;

        return dto;
    }

    async execute(
        userId: string,
        dto: AssignRoleDto,
        requestingUserTenantId: string,
    ): Promise<TenantUserDto> {
        this.logger.debug(`Assigning roles to user ${userId} in tenant ${requestingUserTenantId}`);

        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        // Validate tenant access
        if (user.tenantId !== requestingUserTenantId) {
            throw new ForbiddenException('Access denied to user from different tenant');
        }

        // Validate roles
        const roles = await this.roleRepository.findByIds(dto.roleIds);
        if (roles.length !== dto.roleIds.length) {
            const foundIds = roles.map(r => r.id);
            const notFoundIds = dto.roleIds.filter(id => !foundIds.includes(id));
            throw new BadRequestException(`Invalid Role ID(s): ${notFoundIds.join(', ')}`);
        }

        const roleNames = roles.map(r => r.name);

        // Prevent assigning super admin roles through tenant admin
        if (roleNames.includes(RoleName.SUPER_ADMIN)) {
            throw new ForbiddenException('Cannot assign Super Admin role through tenant administration');
        }

        // Get current role names for comparison
        const currentRoleNames = user.roles?.map(r => r.name) || [];

        // Update roles in Clerk if user has subId
        if (user.subId) {
            try {
                await clerkClient.users.updateUser(user.subId, {
                    publicMetadata: {
                        ...(user.tenantId && { tenantId: user.tenantId }),
                        roles: roleNames,
                    },
                });

                this.logger.log(`Updated Clerk user ${user.subId} with roles: ${roleNames.join(', ')}`);
            } catch (error: unknown) {
                const { message, stack } = extractErrorInfo(error, 'Unknown Clerk update error');
                this.logger.error(
                    `Failed to update roles in Clerk for user ${user.subId}: ${message}`,
                    stack,
                );
                throw new InternalServerErrorException('Failed to update user roles in authentication service');
            }
        }

        try {
            // Update user roles in database
            const updatedUser = await this.userRepository.update(userId, { roleIds: dto.roleIds });

            if (!updatedUser) {
                this.logger.error(`User update for ID ${userId} returned null from repository`);
                
                // Rollback Clerk changes if database update failed
                if (user.subId) {
                    try {
                        await clerkClient.users.updateUser(user.subId, {
                            publicMetadata: {
                                ...(user.tenantId && { tenantId: user.tenantId }),
                                roles: currentRoleNames,
                            },
                        });
                        this.logger.log(`Rolled back Clerk user ${user.subId} roles to: ${currentRoleNames.join(', ')}`);
                    } catch (clerkRollbackError: unknown) {
                        const { message: rollbackMessage, stack: rollbackStack } = extractErrorInfo(
                            clerkRollbackError,
                            'Unknown Clerk rollback error',
                        );
                        this.logger.error(
                            `CRITICAL: Failed to rollback Clerk user ${user.subId} roles after database failure: ${rollbackMessage}`,
                            rollbackStack,
                        );
                    }
                }
                
                throw new InternalServerErrorException('User role assignment failed unexpectedly');
            }

            this.logger.log(`Successfully assigned roles ${roleNames.join(', ')} to user ${userId}`);

            return this.mapToTenantUserDto(updatedUser);
        } catch (dbError: unknown) {
            this.logger.error(`Database error while updating user ${userId} roles:`, dbError);
            
            // Rollback Clerk changes
            if (user.subId) {
                try {
                    await clerkClient.users.updateUser(user.subId, {
                        publicMetadata: {
                            ...(user.tenantId && { tenantId: user.tenantId }),
                            roles: currentRoleNames,
                        },
                    });
                    this.logger.log(`Rolled back Clerk user ${user.subId} roles after database error`);
                } catch (clerkRollbackError: unknown) {
                    const { message: rollbackMessage, stack: rollbackStack } = extractErrorInfo(
                        clerkRollbackError,
                        'Unknown Clerk rollback error',
                    );
                    this.logger.error(
                        `CRITICAL: Failed to rollback Clerk user ${user.subId} roles after database failure: ${rollbackMessage}`,
                        rollbackStack,
                    );
                }
            }
            
            if (dbError instanceof BadRequestException || dbError instanceof ForbiddenException) {
                throw dbError;
            }
            
            throw new InternalServerErrorException('Failed to update user roles');
        }
    }
}