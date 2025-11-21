import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserInvitation } from '../../domain/entities/user-invitation.entity';
import { CreateUserInvitationDto } from '../dto/user-invitation.dto';
import { randomUUID } from 'crypto';

export interface IUserInvitationRepository {
    create(dto: CreateUserInvitationDto, tenantId: string, invitedByUserId: string): Promise<UserInvitation>;
    findById(id: string): Promise<UserInvitation | null>;
    findByEmail(email: string, tenantId: string): Promise<UserInvitation | null>;
    findByToken(token: string): Promise<UserInvitation | null>;
    findAllByTenantId(tenantId: string): Promise<UserInvitation[]>;
    findPendingByTenantId(tenantId: string): Promise<UserInvitation[]>;
    markAsAccepted(id: string, acceptedByUserId: string): Promise<UserInvitation | null>;
    markAsRevoked(id: string): Promise<UserInvitation | null>;
    markAsExpired(id: string): Promise<UserInvitation | null>;
    delete(id: string): Promise<boolean>;
    deleteExpiredInvitations(): Promise<number>;
}

export const USER_INVITATION_REPOSITORY = 'USER_INVITATION_REPOSITORY';

@Injectable()
export class UserInvitationRepository implements IUserInvitationRepository {
    private readonly logger = new Logger(UserInvitationRepository.name);

    constructor(
        @InjectRepository(UserInvitation)
        private readonly ormRepository: Repository<UserInvitation>,
    ) {}

    async create(
        dto: CreateUserInvitationDto,
        tenantId: string,
        invitedByUserId: string,
    ): Promise<UserInvitation> {
        const existingInvitation = await this.findByEmail(dto.email, tenantId);
        if (existingInvitation && existingInvitation.status === 'pending') {
            throw new BadRequestException('Pending invitation already exists for this email in this tenant');
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

        const invitation = this.ormRepository.create({
            email: dto.email,
            firstName: dto.firstName,
            lastName: dto.lastName,
            tenantId,
            invitedByUserId,
            message: dto.message,
            invitationToken: randomUUID(),
            expiresAt,
            status: 'pending',
        });

        return await this.ormRepository.save(invitation);
    }

    async findById(id: string): Promise<UserInvitation | null> {
        return await this.ormRepository.findOne({
            where: { id },
            relations: ['tenant', 'invitedBy', 'acceptedBy'],
        });
    }

    async findByEmail(email: string, tenantId: string): Promise<UserInvitation | null> {
        return await this.ormRepository.findOne({
            where: { email, tenantId },
            relations: ['tenant', 'invitedBy', 'acceptedBy'],
            order: { createdAt: 'DESC' },
        });
    }

    async findByToken(token: string): Promise<UserInvitation | null> {
        return await this.ormRepository.findOne({
            where: { invitationToken: token },
            relations: ['tenant', 'invitedBy', 'acceptedBy'],
        });
    }

    async findAllByTenantId(tenantId: string): Promise<UserInvitation[]> {
        return await this.ormRepository.find({
            where: { tenantId },
            relations: ['tenant', 'invitedBy', 'acceptedBy'],
            order: { createdAt: 'DESC' },
        });
    }

    async findPendingByTenantId(tenantId: string): Promise<UserInvitation[]> {
        return await this.ormRepository.find({
            where: { tenantId, status: 'pending' },
            relations: ['tenant', 'invitedBy'],
            order: { createdAt: 'DESC' },
        });
    }

    async markAsAccepted(id: string, acceptedByUserId: string): Promise<UserInvitation | null> {
        const invitation = await this.findById(id);
        if (!invitation) {
            return null;
        }

        invitation.status = 'accepted';
        invitation.acceptedByUserId = acceptedByUserId;
        invitation.acceptedAt = new Date();

        return await this.ormRepository.save(invitation);
    }

    async markAsRevoked(id: string): Promise<UserInvitation | null> {
        const invitation = await this.findById(id);
        if (!invitation) {
            return null;
        }

        invitation.status = 'revoked';
        return await this.ormRepository.save(invitation);
    }

    async markAsExpired(id: string): Promise<UserInvitation | null> {
        const invitation = await this.findById(id);
        if (!invitation) {
            return null;
        }

        invitation.status = 'expired';
        return await this.ormRepository.save(invitation);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.ormRepository.delete(id);
        return !!result?.affected && result.affected > 0;
    }

    async deleteExpiredInvitations(): Promise<number> {
        const now = new Date();
        const result = await this.ormRepository.delete({
            expiresAt: { $lt: now } as any,
            status: 'pending',
        });
        
        const deletedCount = result?.affected || 0;
        this.logger.log(`Deleted ${deletedCount} expired invitations`);
        return deletedCount;
    }
}