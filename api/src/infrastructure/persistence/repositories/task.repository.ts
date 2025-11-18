import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Task } from '../../../domain/entities/task.entity';
import { ITaskRepository } from '../../../application/repositories/task.repository.interface';
import { CreateTaskDto } from '../../../application/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '../../../application/tasks/dto/update-task.dto';
import { TaskQueryDto, TaskPaginationResponseDto } from '../../../application/tasks/dto/task-query.dto';

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
            relations: ['assignee', 'tenant'],
        });
    }

    async findByExternalId(externalId: string): Promise<Task | null> {
        return this.ormRepository.findOne({
            where: { externalId },
            relations: ['assignee', 'tenant'],
        });
    }

    async findAllByTenantId(
        tenantId: string,
        query?: TaskQueryDto,
    ): Promise<TaskPaginationResponseDto> {
        const queryBuilder = this.ormRepository
            .createQueryBuilder('task')
            .leftJoinAndSelect('task.assignee', 'assignee')
            .leftJoinAndSelect('task.tenant', 'tenant')
            .where('task.tenantId = :tenantId', { tenantId });

        return this.buildPaginatedQuery(queryBuilder, query);
    }

    async findAll(query?: TaskQueryDto): Promise<TaskPaginationResponseDto> {
        const queryBuilder = this.ormRepository
            .createQueryBuilder('task')
            .leftJoinAndSelect('task.assignee', 'assignee')
            .leftJoinAndSelect('task.tenant', 'tenant');

        return this.buildPaginatedQuery(queryBuilder, query);
    }

    private async buildPaginatedQuery(
        queryBuilder: SelectQueryBuilder<Task>,
        query?: TaskQueryDto,
    ): Promise<TaskPaginationResponseDto> {
        if (query?.status) {
            queryBuilder.andWhere('task.status = :status', { status: query.status });
        }

        if (query?.priority) {
            queryBuilder.andWhere('task.priority = :priority', { priority: query.priority });
        }

        if (query?.assigneeId) {
            queryBuilder.andWhere('task.assigneeId = :assigneeId', {
                assigneeId: query.assigneeId,
            });
        }

        if (query?.projectId) {
            queryBuilder.andWhere('task.projectId = :projectId', {
                projectId: query.projectId,
            });
        }

        if (query?.search) {
            queryBuilder.andWhere(
                '(task.title ILIKE :search OR task.description ILIKE :search)',
                { search: `%${query.search}%` },
            );
        }

        const sortBy = query?.sortBy || 'createdAt';
        const sortOrder = query?.sortOrder || 'desc';
        
        const allowedSortFields = ['title', 'status', 'priority', 'createdAt', 'updatedAt'];
        if (allowedSortFields.includes(sortBy)) {
            queryBuilder.orderBy(`task.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');
        }

        const page = query?.page || 1;
        const limit = query?.limit || 10;
        const offset = (page - 1) * limit;

        const [data, total] = await queryBuilder
            .skip(offset)
            .take(limit)
            .getManyAndCount();

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            total,
            page,
            limit,
            totalPages,
        };
    }

    async create(dto: CreateTaskDto, tenantId: string): Promise<Task> {
        const task = this.ormRepository.create({
            ...dto,
            tenantId,
        });

        return await this.ormRepository.save(task);
    }

    async update(id: string, dto: UpdateTaskDto): Promise<Task | null> {
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
}