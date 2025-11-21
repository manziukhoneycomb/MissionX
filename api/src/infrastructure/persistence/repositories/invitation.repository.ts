import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Invitation, InvitationStatus } from '../../../domain/entities/invitation.entity';
import { IInvitationRepository } from '../../../application/repositories/invitation.repository.interface';

@Injectable()
export class InvitationRepository implements IInvitationRepository {
    constructor(
        @InjectRepository(Invitation)
        private readonly invitationRepository: Repository<Invitation>,
    ) {}

    async save(invitation: Invitation): Promise<Invitation> {
        return this.invitationRepository.save(invitation);
    }

    async findById(id: string): Promise<Invitation | null> {
        return this.invitationRepository.findOne({
            where: { id },
            relations: ['tenant', 'roles'],
        });
    }

    async findByEmail(email: string, tenantId: string): Promise<Invitation | null> {
        return this.invitationRepository.findOne({
            where: { email, tenantId },
            relations: ['tenant', 'roles'],
        });
    }

    async findAllByTenantId(tenantId: string): Promise<Invitation[]> {
        return this.invitationRepository.find({
            where: { tenantId },
            relations: ['tenant', 'roles'],
            order: { createdAt: 'DESC' },
        });
    }

    async findActiveByEmail(email: string): Promise<Invitation | null> {
        return this.invitationRepository.findOne({
            where: {
                email,
                status: InvitationStatus.PENDING,
                expiresAt: MoreThan(new Date()),
            },
            relations: ['tenant', 'roles'],
        });
    }

    async update(id: string, invitation: Partial<Invitation>): Promise<Invitation> {
        await this.invitationRepository.update(id, invitation);
        const updatedInvitation = await this.findById(id);
        
        if (!updatedInvitation) {
            throw new Error(`Invitation with ID ${id} not found after update`);
        }
        
        return updatedInvitation;
    }

    async delete(id: string): Promise<void> {
        await this.invitationRepository.delete(id);
    }

    async findExpiredInvitations(): Promise<Invitation[]> {
        return this.invitationRepository.find({
            where: {
                status: InvitationStatus.PENDING,
                expiresAt: LessThan(new Date()),
            },
            relations: ['tenant', 'roles'],
        });
    }
}