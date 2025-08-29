import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../repositories/user.repository.interface';
import { IRoleRepository, ROLE_REPOSITORY } from '../repositories/role.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { RoleName } from '../../domain/enums/role-name.enum';
import { IUserCommands } from './interfaces/user-commands.interface';
import { CreateUserDto, CreateUserBySuperAdminDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { RoleDto } from '../roles/dto/role.dto';
import { TenantDto } from '../tenants/dto/tenant.dto';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { extractErrorInfo } from '../../domain/utils/error.utils';

@Injectable()
export class UserCommands implements IUserCommands {
    private readonly logger = new Logger(UserCommands.name);

    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        @Inject(ROLE_REPOSITORY)
        private readonly roleRepository: IRoleRepository,
    ) {}

    private mapToDto(user: User | null): UserDto | null {
        if (!user) {
            return null;
        }

        const dto = new UserDto();

        dto.id = user.id;
        dto.email = user.email;
        dto.subId = user.subId;
        dto.firstName = user.firstName;
        dto.lastName = user.lastName;
        dto.createdAt = user.createdAt;
        dto.updatedAt = user.updatedAt;

        if (user.tenant) {
            dto.tenant = { id: user.tenant.id, name: user.tenant.name } as Pick<
                TenantDto,
                'id' | 'name'
            >;
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

        return dto;
    }

    async createUser(dto: CreateUserDto, tenantId: string): Promise<UserDto> {
        await this.validateUserDoesNotExist(dto.email);
        await this.validateRoleAssignmentPermissions(dto.roleIds, false);

        let clerkUserId: string;

        try {
            const roles = await this.roleRepository.findByIds(dto.roleIds);
            const clerkUser = await clerkClient.users.createUser({
                emailAddress: [dto.email],
                firstName: dto.firstName,
                lastName: dto.lastName,
                skipPasswordRequirement: true,
                publicMetadata: {
                    roles: roles.map((r) => r.name),
                    tenantId: tenantId,
                },
            });

            clerkUserId = clerkUser.id;

            this.logger.log(
                `Successfully created Clerk user ${clerkUserId} for local user creation (Admin flow)`,
            );
        } catch (error: unknown) {
            const { message, stack } = extractErrorInfo(
                error,
                'Unknown error during Clerk user creation',
            );
            this.logger.error(
                `Failed to create Clerk user for email: ${dto.email} (Admin flow). Error: ${message}`,
                stack,
            );
            throw new InternalServerErrorException(
                'User creation failed during external service interaction.',
            );
        }

        let createdUser: User;

        try {
            createdUser = await this.userRepository.create(dto, tenantId, clerkUserId);

            this.logger.log(
                `Created local user ${createdUser.id} with subId ${clerkUserId} (Admin flow).`,
            );

            const userDto = this.mapToDto(createdUser);

            if (!userDto) {
                this.logger.error(
                    `Failed to map user ID ${createdUser.id} to DTO after creation and setSubId.`,
                );

                throw new InternalServerErrorException('Failed to map created user.');
            }

            return userDto;
        } catch (localError: unknown) {
            const { message, stack } = extractErrorInfo(localError, 'Unknown local DB error');
            this.logger.error(
                `Failed to create/finalize local user for email ${dto.email} after Clerk user ${clerkUserId} was created (Admin flow). Attempting Clerk rollback. Error: ${message}`,
                stack,
            );

            try {
                await clerkClient.users.deleteUser(clerkUserId);
                this.logger.log(
                    `Rolled back Clerk user ${clerkUserId} due to local DB failure (Admin flow).`,
                );
            } catch (clerkRollbackError: unknown) {
                const { message: rollbackMessage, stack: rollbackStack } = extractErrorInfo(
                    clerkRollbackError,
                    'Unknown Clerk rollback error',
                );
                this.logger.error(
                    `CRITICAL: Failed to rollback Clerk user ${clerkUserId} after local DB failure (Admin flow). Error: ${rollbackMessage}`,
                    rollbackStack,
                );
            }
            throw new InternalServerErrorException(
                'User creation failed during local database operation. External user may exist.',
            );
        }
    }

    async createUserBySuperAdmin(dto: CreateUserBySuperAdminDto): Promise<UserDto> {
        await this.validateUserDoesNotExist(dto.email);

        const roles = await this.roleRepository.findByIds(dto.roleIds);

        if (roles.length !== dto.roleIds.length) {
            throw new BadRequestException('One or more specified role IDs are invalid.');
        }

        const roleNames = roles.map((r) => r.name);

        if (dto.tenantId === undefined) {
            if (roleNames.length !== 1 || roleNames[0] !== RoleName.SUPER_ADMIN) {
                throw new BadRequestException(
                    'Users without a tenant must have only the SUPER_ADMIN role.',
                );
            }
        } else {
            const allowedRoles = [RoleName.USER, RoleName.ADMIN];
            const containsSuperAdmin = roleNames.includes(RoleName.SUPER_ADMIN);
            const containsInvalidRoles = roleNames.some((name) => !allowedRoles.includes(name));

            if (containsSuperAdmin || containsInvalidRoles || roleNames.length === 0) {
                throw new ForbiddenException('Invalid role assignment.');
            }
        }

        let clerkUserId: string;

        try {
            const clerkUser = await clerkClient.users.createUser({
                emailAddress: [dto.email],
                firstName: dto.firstName,
                lastName: dto.lastName,
                skipPasswordRequirement: true,
                publicMetadata: {
                    roles: roleNames,
                    tenantId: dto.tenantId,
                },
            });

            clerkUserId = clerkUser.id;

            this.logger.log(
                `Successfully created Clerk user ${clerkUserId} (by SuperAdmin) for email: ${dto.email}`,
            );
        } catch (error: unknown) {
            const { message, stack } = extractErrorInfo(
                error,
                'Unknown error during Clerk user creation',
            );
            this.logger.error(
                `Failed to create Clerk user (by SuperAdmin) for email: ${dto.email}. Error: ${message}`,
                stack,
            );
            throw new InternalServerErrorException(
                'User creation failed during external service interaction.',
            );
        }

        try {
            const invitation = await clerkClient.invitations.createInvitation({
                emailAddress: dto.email,
                ignoreExisting: true,
            });
            this.logger.log(
                `Successfully triggered Clerk invitation ${invitation.id} for email: ${dto.email} (ignoreExisting=true)`,
            );
        } catch (invitationError: unknown) {
            const { message, stack } = extractErrorInfo(
                invitationError,
                'Unknown Clerk invitation error',
            );
            this.logger.warn(
                `Failed to send Clerk invitation for email ${dto.email} after user ${clerkUserId} was created. Proceeding with local user creation. Error: ${message}`,
                stack,
            );
        }

        const { tenantId, ...userDtoData } = dto;

        let createdUser: User;
        try {
            createdUser = await this.userRepository.create(userDtoData, tenantId, clerkUserId);
        } catch (localError: unknown) {
            const { message, stack } = extractErrorInfo(localError, 'Unknown local DB error');
            this.logger.error(
                `Failed to create/finalize local user for email ${dto.email} after Clerk user ${clerkUserId} was created. Attempting Clerk rollback. Error: ${message}`,
                stack,
            );

            try {
                await clerkClient.users.deleteUser(clerkUserId);
                this.logger.log(`Rolled back Clerk user ${clerkUserId} due to local DB failure.`);
            } catch (clerkRollbackError: unknown) {
                const { message: rollbackMessage, stack: rollbackStack } = extractErrorInfo(
                    clerkRollbackError,
                    'Unknown Clerk rollback error',
                );
                this.logger.error(
                    `CRITICAL: Failed to rollback Clerk user ${clerkUserId} after local DB failure. Error: ${rollbackMessage}`,
                    rollbackStack,
                );
            }
            throw new InternalServerErrorException(
                'User creation failed during local database operation. External user may exist.',
            );
        }

        const userDto = this.mapToDto(createdUser);

        if (!userDto) {
            this.logger.error(
                `Failed to map user ID ${createdUser.id} to DTO after creation by super admin.`,
            );
            throw new InternalServerErrorException('Failed to map created user.');
        }

        return userDto;
    }

    async updateUser(
        id: string,
        dto: UpdateUserDto,
        requestingUserTenantId?: string,
        isSuperAdmin: boolean = false,
    ): Promise<UserDto> {
        const userToUpdate = await this.userRepository.findById(id);

        if (!userToUpdate) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        if (
            !isSuperAdmin &&
            requestingUserTenantId !== undefined &&
            userToUpdate.tenantId !== requestingUserTenantId
        ) {
            throw new ForbiddenException('Cannot update user from different tenant.');
        }

        if (dto.roleIds !== undefined) {
            await this.validateRoleAssignmentPermissions(
                dto.roleIds,
                isSuperAdmin,
                userToUpdate.roles?.map((r) => r.name),
            );
        }

        if (dto.roleIds !== undefined && userToUpdate.subId) {
            const roles = await this.roleRepository.findByIds(dto.roleIds);

            await clerkClient.users.updateUser(userToUpdate.subId, {
                firstName: dto.firstName,
                lastName: dto.lastName,
                publicMetadata: {
                    ...(userToUpdate.tenantId && { tenantId: userToUpdate.tenantId }),
                    roles: roles.map((r) => r.name),
                },
            });
        }

        const updatedUser = await this.userRepository.update(id, dto);

        if (!updatedUser) {
            this.logger.error(`User update for ID ${id} returned null from repository.`);
            throw new InternalServerErrorException('User update failed unexpectedly.');
        }

        const updatedDto = this.mapToDto(updatedUser);

        if (!updatedDto) {
            this.logger.error(`Failed to map updated user ID ${id} to DTO.`);
            throw new InternalServerErrorException('Failed to map updated user.');
        }

        return updatedDto;
    }

    async deleteUser(
        id: string,
        requestingUserTenantId?: string,
        isSuperAdmin: boolean = false,
    ): Promise<void> {
        const userToDelete = await this.userRepository.findById(id);

        if (!userToDelete) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        if (
            !isSuperAdmin &&
            requestingUserTenantId !== undefined &&
            userToDelete.tenantId !== requestingUserTenantId
        )
            throw new ForbiddenException('Cannot delete user from different tenant.');

        if (!isSuperAdmin && userToDelete.roles?.some((r) => r.name === RoleName.SUPER_ADMIN))
            throw new ForbiddenException('Cannot delete a Super Admin.');

        const clerkUserIdToDelete = userToDelete.subId;

        if (clerkUserIdToDelete) {
            try {
                await clerkClient.users.deleteUser(clerkUserIdToDelete);
                this.logger.log(
                    `Successfully deleted Clerk user ${clerkUserIdToDelete} for local user ID: ${id}`,
                );
            } catch (error: unknown) {
                const { message, stack } = extractErrorInfo(error, 'Unknown Clerk deletion error');
                this.logger.error(
                    `Failed to delete Clerk user ${clerkUserIdToDelete} for local user ID: ${id}. Proceeding with local deletion. Error: ${message}`,
                    stack,
                );
            }
        } else {
            this.logger.warn(
                `Local user ${id} does not have a subId (Clerk ID). Skipping Clerk deletion.`,
            );
        }

        const deleted = await this.userRepository.delete(id);

        if (!deleted) {
            throw new NotFoundException(
                `User with ID ${id} could not be deleted locally, potentially already deleted.`,
            );
        }
        this.logger.log(`Successfully deleted local user ID: ${id}`);
    }

    async activateUser(
        id: string,
        requestingUserTenantId?: string,
        isSuperAdmin: boolean = false,
    ): Promise<void> {
        const userToActivate = await this.userRepository.findById(id);

        if (!userToActivate) {
            throw new NotFoundException(`User with ID ${id} not found.`);
        }

        if (
            !isSuperAdmin &&
            requestingUserTenantId !== undefined &&
            userToActivate.tenantId !== requestingUserTenantId
        ) {
            this.logger.warn(
                `Forbidden attempt to activate user ${id} by tenant ${requestingUserTenantId}. User belongs to tenant ${userToActivate.tenantId}.`,
            );
            throw new ForbiddenException('Cannot activate user from a different tenant.');
        }

        await clerkClient.users.unlockUser(userToActivate.subId!);

        try {
            await this.userRepository.activate(id);
        } catch (error: unknown) {
            try {
                await clerkClient.users.lockUser(userToActivate.subId!);
            } catch (clerkRollbackError: unknown) {
                const { message: rollbackMessage, stack: rollbackStack } = extractErrorInfo(
                    clerkRollbackError,
                    'Unknown Clerk rollback error',
                );
                this.logger.error(
                    `CRITICAL: Failed to rollback (lock) Clerk user ${userToActivate.subId} after local DB failure during activation. Error: ${rollbackMessage}`,
                    rollbackStack,
                );
            }

            throw error;
        }
    }

    async deactivateUser(
        id: string,
        requestingUserTenantId?: string,
        isSuperAdmin: boolean = false,
    ): Promise<void> {
        const userToDeactivate = await this.userRepository.findById(id);

        if (!userToDeactivate) {
            throw new NotFoundException(`User with ID ${id} not found.`);
        }

        if (
            !isSuperAdmin &&
            requestingUserTenantId !== undefined &&
            userToDeactivate.tenantId !== requestingUserTenantId
        ) {
            this.logger.warn(
                `Forbidden attempt to deactivate user ${id} by tenant ${requestingUserTenantId}. User belongs to tenant ${userToDeactivate.tenantId}.`,
            );
            throw new ForbiddenException('Cannot deactivate user from a different tenant.');
        }

        await clerkClient.users.lockUser(userToDeactivate.subId!);
        const userSessions = await clerkClient.sessions.getSessionList({
            userId: userToDeactivate.subId!,
        });

        for (const session of userSessions.data) {
            await clerkClient.sessions.revokeSession(session.id);
        }

        try {
            await this.userRepository.deactivate(id);
        } catch (error: unknown) {
            try {
                await clerkClient.users.unlockUser(userToDeactivate.subId!);
            } catch (clerkRollbackError: unknown) {
                const { message: rollbackMessage, stack: rollbackStack } = extractErrorInfo(
                    clerkRollbackError,
                    'Unknown Clerk rollback error',
                );
                this.logger.error(
                    `CRITICAL: Failed to rollback (unlock) Clerk user ${userToDeactivate.subId} after local DB failure during deactivation. Error: ${rollbackMessage}`,
                    rollbackStack,
                );
            }

            throw error;
        }
    }

    private async validateUserDoesNotExist(email: string): Promise<void> {
        const existingByEmail = await this.userRepository.findByEmail(email);

        if (existingByEmail) {
            throw new BadRequestException('Email already exists');
        }
    }

    private async validateRoleAssignmentPermissions(
        roleIdsToAssign?: string[],
        isAssignerSuperAdmin: boolean = false,
        currentVictimRoles?: RoleName[],
    ): Promise<void> {
        if (!roleIdsToAssign || roleIdsToAssign.length === 0) {
            if (!isAssignerSuperAdmin && currentVictimRoles?.includes(RoleName.SUPER_ADMIN)) {
                throw new ForbiddenException('Cannot change roles of a Super Admin.');
            }

            return;
        }

        const rolesToAssignEntities = await this.roleRepository.findByIds(roleIdsToAssign);

        if (rolesToAssignEntities.length !== roleIdsToAssign.length) {
            throw new BadRequestException('One or more specified role IDs are invalid.');
        }

        const roleNamesToAssign = rolesToAssignEntities.map((r) => r.name);

        if (!isAssignerSuperAdmin && roleNamesToAssign.includes(RoleName.SUPER_ADMIN)) {
            throw new ForbiddenException('Cannot assign Super Admin role.');
        }

        if (!isAssignerSuperAdmin && currentVictimRoles?.includes(RoleName.SUPER_ADMIN)) {
            throw new ForbiddenException('Cannot change roles of a Super Admin.');
        }
    }
}
