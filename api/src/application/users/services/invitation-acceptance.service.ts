import {
    Injectable,
    Logger,
    InternalServerErrorException,
    BadRequestException,
} from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../repositories/user.repository.interface';
import { IRoleRepository, ROLE_REPOSITORY } from '../../repositories/role.repository.interface';
import { Inject } from '@nestjs/common';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { extractErrorInfo } from '../../../domain/utils/error.utils';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserDto } from '../dto/user.dto';

@Injectable()
export class InvitationAcceptanceService {
    private readonly logger = new Logger(InvitationAcceptanceService.name);

    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        @Inject(ROLE_REPOSITORY)
        private readonly roleRepository: IRoleRepository,
    ) {}

    async handleInvitationAcceptance(clerkUserId: string, email: string): Promise<UserDto | null> {
        try {
            const existingUser = await this.userRepository.findBySubId(clerkUserId);
            
            if (existingUser) {
                this.logger.log(`User already exists for Clerk ID ${clerkUserId}. No action needed.`);
                return this.mapToDto(existingUser);
            }

            const clerkUser = await clerkClient.users.getUser(clerkUserId);
            const metadata = clerkUser.publicMetadata;
            
            if (!metadata || !metadata.tenantId || !metadata.roles) {
                this.logger.warn(
                    `User ${clerkUserId} accepted invitation but missing tenant/role metadata. Skipping local user creation.`
                );
                return null;
            }

            const tenantId = metadata.tenantId as string;
            const roleNames = metadata.roles as string[];

            const roles = [];
            for (const roleName of roleNames) {
                const role = await this.roleRepository.findByName(roleName as any);
                if (role) {
                    roles.push(role);
                }
            }

            if (roles.length === 0) {
                this.logger.error(
                    `No valid roles found for user ${clerkUserId} with role names: ${roleNames.join(', ')}`
                );
                return null;
            }

            const createUserDto = new CreateUserDto();
            createUserDto.email = email || clerkUser.emailAddresses[0]?.emailAddress || '';
            createUserDto.firstName = clerkUser.firstName || undefined;
            createUserDto.lastName = clerkUser.lastName || undefined;
            createUserDto.roleIds = roles.map(role => role.id);

            const localUser = await this.userRepository.create(createUserDto, tenantId, clerkUserId);

            this.logger.log(
                `Successfully created local user ${localUser.id} for accepted invitation from Clerk user ${clerkUserId}`
            );

            return this.mapToDto(localUser);

        } catch (error: unknown) {
            const { message, stack } = extractErrorInfo(error, 'Unknown invitation acceptance error');
            this.logger.error(
                `Failed to handle invitation acceptance for Clerk user ${clerkUserId}. Error: ${message}`,
                stack
            );
            throw new InternalServerErrorException('Failed to complete user registration from invitation.');
        }
    }

    private mapToDto(user: any): UserDto | null {
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
        dto.isActive = user.isActive;

        if (user.tenant) {
            dto.tenant = { id: user.tenant.id, name: user.tenant.name };
        }

        if (user.roles) {
            dto.roles = user.roles.map((role: any) => ({
                id: role.id,
                name: role.name,
            }));
        }

        return dto;
    }
}