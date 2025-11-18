import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Webhook } from './webhook.entity';

@Entity('webhook_events')
export class WebhookEvent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    eventType: string;

    @Column({ length: 500, nullable: true })
    description?: string;

    @Column({ default: true, name: 'is_active' })
    isActive: boolean;

    @Column('simple-json', { nullable: true })
    payload?: Record<string, any>;

    @Column({ name: 'webhook_id' })
    webhookId: string;

    @ManyToOne(() => Webhook, (webhook) => webhook.webhookEvents, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'webhook_id' })
    webhook: Webhook;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}