import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWebhookTables1748626000000 implements MigrationInterface {
    name = 'CreateWebhookTables1748626000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "webhooks" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "url" character varying(2048) NOT NULL, 
                "method" character varying(10) NOT NULL DEFAULT 'POST', 
                "events" text array NOT NULL DEFAULT '{}', 
                "is_active" boolean NOT NULL DEFAULT true, 
                "secret" character varying(255), 
                "headers" jsonb, 
                "retryPolicy" jsonb, 
                "timeout" integer NOT NULL DEFAULT 30000, 
                "max_retries" integer NOT NULL DEFAULT 3, 
                "tenant_id" uuid NOT NULL, 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_2c3ab5e1f67e74f02fb8aa99ad5" PRIMARY KEY ("id")
            )`,
        );
        
        await queryRunner.query(
            `CREATE TABLE "webhook_events" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "event_type" character varying(100) NOT NULL, 
                "event_name" character varying(100) NOT NULL, 
                "description" text, 
                "is_active" boolean NOT NULL DEFAULT true, 
                "webhook_id" uuid NOT NULL, 
                "tenant_id" uuid NOT NULL, 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_38b68c5e4dfd57b0ac62b4e5c5f" PRIMARY KEY ("id")
            )`,
        );
        
        await queryRunner.query(
            `CREATE TABLE "webhook_logs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "event_type" character varying(100) NOT NULL, 
                "payload" jsonb NOT NULL, 
                "status" character varying(20) NOT NULL DEFAULT 'pending', 
                "http_status" integer, 
                "response" text, 
                "error_message" text, 
                "attempt_count" integer NOT NULL DEFAULT 0, 
                "max_attempts" integer NOT NULL DEFAULT 3, 
                "next_retry_at" TIMESTAMP, 
                "delivered_at" TIMESTAMP, 
                "webhook_id" uuid NOT NULL, 
                "tenant_id" uuid NOT NULL, 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_3bfc4b0c1ce9a9e0e2b9f5a6c7d" PRIMARY KEY ("id")
            )`,
        );

        await queryRunner.query(
            `ALTER TABLE "webhooks" ADD CONSTRAINT "FK_webhooks_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        
        await queryRunner.query(
            `ALTER TABLE "webhook_events" ADD CONSTRAINT "FK_webhook_events_webhook_id" FOREIGN KEY ("webhook_id") REFERENCES "webhooks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        
        await queryRunner.query(
            `ALTER TABLE "webhook_events" ADD CONSTRAINT "FK_webhook_events_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        
        await queryRunner.query(
            `ALTER TABLE "webhook_logs" ADD CONSTRAINT "FK_webhook_logs_webhook_id" FOREIGN KEY ("webhook_id") REFERENCES "webhooks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        
        await queryRunner.query(
            `ALTER TABLE "webhook_logs" ADD CONSTRAINT "FK_webhook_logs_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );

        await queryRunner.query(
            `CREATE INDEX "IDX_webhooks_tenant_id" ON "webhooks" ("tenant_id")`,
        );
        
        await queryRunner.query(
            `CREATE INDEX "IDX_webhooks_is_active" ON "webhooks" ("is_active")`,
        );
        
        await queryRunner.query(
            `CREATE INDEX "IDX_webhook_events_webhook_id" ON "webhook_events" ("webhook_id")`,
        );
        
        await queryRunner.query(
            `CREATE INDEX "IDX_webhook_events_event_type" ON "webhook_events" ("event_type")`,
        );
        
        await queryRunner.query(
            `CREATE INDEX "IDX_webhook_logs_webhook_id" ON "webhook_logs" ("webhook_id")`,
        );
        
        await queryRunner.query(
            `CREATE INDEX "IDX_webhook_logs_status" ON "webhook_logs" ("status")`,
        );
        
        await queryRunner.query(
            `CREATE INDEX "IDX_webhook_logs_created_at" ON "webhook_logs" ("createdAt")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_webhook_logs_created_at"`);
        await queryRunner.query(`DROP INDEX "IDX_webhook_logs_status"`);
        await queryRunner.query(`DROP INDEX "IDX_webhook_logs_webhook_id"`);
        await queryRunner.query(`DROP INDEX "IDX_webhook_events_event_type"`);
        await queryRunner.query(`DROP INDEX "IDX_webhook_events_webhook_id"`);
        await queryRunner.query(`DROP INDEX "IDX_webhooks_is_active"`);
        await queryRunner.query(`DROP INDEX "IDX_webhooks_tenant_id"`);
        
        await queryRunner.query(`ALTER TABLE "webhook_logs" DROP CONSTRAINT "FK_webhook_logs_tenant_id"`);
        await queryRunner.query(`ALTER TABLE "webhook_logs" DROP CONSTRAINT "FK_webhook_logs_webhook_id"`);
        await queryRunner.query(`ALTER TABLE "webhook_events" DROP CONSTRAINT "FK_webhook_events_tenant_id"`);
        await queryRunner.query(`ALTER TABLE "webhook_events" DROP CONSTRAINT "FK_webhook_events_webhook_id"`);
        await queryRunner.query(`ALTER TABLE "webhooks" DROP CONSTRAINT "FK_webhooks_tenant_id"`);
        
        await queryRunner.query(`DROP TABLE "webhook_logs"`);
        await queryRunner.query(`DROP TABLE "webhook_events"`);
        await queryRunner.query(`DROP TABLE "webhooks"`);
    }
}