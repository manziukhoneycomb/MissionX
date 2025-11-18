import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Task } from '../../../domain/entities/task.entity';
import { ITaskRepository } from '../../../application/repositories/task.repository.interface';
import { CreateTaskDto, CreateTaskFromAzureDto } from '../../../application/tasks/dto/create-task.dto';
import { UpdateTaskDto, UpdateTaskFromAzureDto } from '../../../application/tasks/dto/update-task.dto';

@Injectable()
export class TaskRepository implements ITaskRepository {
    private readonly logger = new Logger(TaskRepository.name);

    constructor(
        @InjectRepository(Task)
        private readonly ormRepository: Repository<Task>,
    ) {}

    async findById(id: string): Promise<Task | null> {
        return this.ormRepository.findOne({
            where: { id },
            relations: ['tenant', 'assignedUser', 'createdBy'],
        });
    }

    async findByAzureDevOpsId(azureDevOpsId: number, tenantId: string): Promise<Task | null> {
        return this.ormRepository.findOne({
            where: { azureDevOpsId, tenantId },
            relations: ['tenant', 'assignedUser', 'createdBy'],
        });
    }

    async findAllByTenantId(
        tenantId: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<{ tasks: Task[]; total: number }> {
        const [tasks, total] = await this.ormRepository.findAndCount({
            where: { tenantId },
            relations: ['tenant', 'assignedUser', 'createdBy'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return { tasks, total };
    }

    async findByAssignedUserId(assignedUserId: string, tenantId: string): Promise<Task[]> {
        return this.ormRepository.find({
            where: { assignedUserId, tenantId },
            relations: ['tenant', 'assignedUser', 'createdBy'],
            order: { createdAt: 'DESC' },
        });
    }

    async create(
        dto: CreateTaskDto | CreateTaskFromAzureDto,
        tenantId: string,
        createdById?: string,
    ): Promise<Task> {
        const task = this.ormRepository.create({
            ...dto,
            tenantId,
            createdById,
        });

        return await this.ormRepository.save(task);
    }

    async update(id: string, dto: UpdateTaskDto | UpdateTaskFromAzureDto): Promise<Task | null> {
        const task = await this.findById(id);

        if (!task) {
            this.logger.warn(`Task with ID ${id} not found for update.`);
            return null;
        }

        this.ormRepository.merge(task, dto);
        return await this.ormRepository.save(task);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.ormRepository.delete(id);
        return !!result?.affected && result.affected > 0;
    }

    async findTasksNeedingSync(tenantId: string): Promise<Task[]> {
        return this.ormRepository.find({
            where: [
                { tenantId, azureDevOpsId: Not(IsNull()), lastSyncAt: IsNull() },
                { tenantId, azureDevOpsId: Not(IsNull()), syncError: Not(IsNull()) },
            ],
            relations: ['tenant', 'assignedUser', 'createdBy'],
        });
    }

    async updateSyncStatus(id: string, lastSyncAt: Date, syncError?: string): Promise<void> {
        await this.ormRepository.update(id, {
            lastSyncAt,
            syncError: syncError || null,
        });
    }
}