import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWebhookTables1744809478849 implements MigrationInterface {
    name = 'CreateWebhookTables1744809478849';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create webhook_events table first (no dependencies)
        await queryRunner.query(
            `CREATE TABLE "webhook_events" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "eventType" character varying(100) NOT NULL,
                "description" character varying(255) NOT NULL,
                "isActive" boolean NOT NULL DEFAULT true,
                "category" character varying(50),
                "schema" jsonb,
                "tenant_id" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_webhook_events" PRIMARY KEY ("id")
            )`
        );

        // Create webhooks table
        await queryRunner.query(
            `CREATE TABLE "webhooks" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "url" character varying(500) NOT NULL,
                "method" character varying(10) NOT NULL DEFAULT 'POST',
                "events" text array NOT NULL,
                "isActive" boolean NOT NULL DEFAULT true,
                "secret" character varying(255),
                "headers" jsonb,
                "retryPolicy" jsonb,
                "timeout" integer NOT NULL DEFAULT 30000,
                "maxRetries" integer NOT NULL DEFAULT 3,
                "tenant_id" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_webhooks" PRIMARY KEY ("id")
            )`
        );

        // Create webhook_logs table
        await queryRunner.query(
            `CREATE TABLE "webhook_logs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "webhook_id" uuid NOT NULL,
                "eventType" character varying(100) NOT NULL,
                "payload" jsonb NOT NULL,
                "status" character varying(20) NOT NULL,
                "httpStatusCode" integer,
                "response" text,
                "error" text,
                "attempts" integer NOT NULL DEFAULT 0,
                "nextRetryAt" TIMESTAMP,
                "duration" integer,
                "tenant_id" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_webhook_logs" PRIMARY KEY ("id")
            )`
        );

        // Add foreign key constraints
        await queryRunner.query(
            `ALTER TABLE "webhook_events" ADD CONSTRAINT "FK_webhook_events_tenant" 
             FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE`
        );

        await queryRunner.query(
            `ALTER TABLE "webhooks" ADD CONSTRAINT "FK_webhooks_tenant" 
             FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE`
        );

        await queryRunner.query(
            `ALTER TABLE "webhook_logs" ADD CONSTRAINT "FK_webhook_logs_webhook" 
             FOREIGN KEY ("webhook_id") REFERENCES "webhooks"("id") ON DELETE CASCADE`
        );

        await queryRunner.query(
            `ALTER TABLE "webhook_logs" ADD CONSTRAINT "FK_webhook_logs_tenant" 
             FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE`
        );

        // Create indexes for better performance
        await queryRunner.query(
            `CREATE INDEX "IDX_webhook_events_event_type" ON "webhook_events" ("eventType")`
        );

        await queryRunner.query(
            `CREATE INDEX "IDX_webhook_events_tenant" ON "webhook_events" ("tenant_id")`
        );

        await queryRunner.query(
            `CREATE INDEX "IDX_webhook_events_category" ON "webhook_events" ("category")`
        );

        await queryRunner.query(
            `CREATE INDEX "IDX_webhooks_tenant" ON "webhooks" ("tenant_id")`
        );

        await queryRunner.query(
            `CREATE INDEX "IDX_webhooks_events" ON "webhooks" USING GIN ("events")`
        );

        await queryRunner.query(
            `CREATE INDEX "IDX_webhooks_active" ON "webhooks" ("isActive")`
        );

        await queryRunner.query(
            `CREATE INDEX "IDX_webhook_logs_webhook" ON "webhook_logs" ("webhook_id")`
        );

        await queryRunner.query(
            `CREATE INDEX "IDX_webhook_logs_tenant" ON "webhook_logs" ("tenant_id")`
        );

        await queryRunner.query(
            `CREATE INDEX "IDX_webhook_logs_event_type" ON "webhook_logs" ("eventType")`
        );

        await queryRunner.query(
            `CREATE INDEX "IDX_webhook_logs_status" ON "webhook_logs" ("status")`
        );

        await queryRunner.query(
            `CREATE INDEX "IDX_webhook_logs_created_at" ON "webhook_logs" ("createdAt")`
        );

        await queryRunner.query(
            `CREATE INDEX "IDX_webhook_logs_next_retry" ON "webhook_logs" ("nextRetryAt") WHERE "nextRetryAt" IS NOT NULL`
        );

        // Insert default webhook events
        await queryRunner.query(`
            INSERT INTO "webhook_events" ("eventType", "description", "category", "schema") VALUES 
            ('user.created', 'Triggered when a new user is created', 'user', '{"type": "object", "properties": {"userId": {"type": "string"}, "email": {"type": "string"}, "tenantId": {"type": "string"}}}'),
            ('user.updated', 'Triggered when a user is updated', 'user', '{"type": "object", "properties": {"userId": {"type": "string"}, "email": {"type": "string"}, "tenantId": {"type": "string"}}}'),
            ('user.deleted', 'Triggered when a user is deleted', 'user', '{"type": "object", "properties": {"userId": {"type": "string"}, "tenantId": {"type": "string"}}}'),
            ('invoice.created', 'Triggered when a new invoice is created', 'invoice', '{"type": "object", "properties": {"invoiceId": {"type": "string"}, "invoiceNumber": {"type": "string"}, "tenantId": {"type": "string"}}}'),
            ('invoice.updated', 'Triggered when an invoice is updated', 'invoice', '{"type": "object", "properties": {"invoiceId": {"type": "string"}, "invoiceNumber": {"type": "string"}, "tenantId": {"type": "string"}}}'),
            ('invoice.paid', 'Triggered when an invoice is marked as paid', 'invoice', '{"type": "object", "properties": {"invoiceId": {"type": "string"}, "invoiceNumber": {"type": "string"}, "tenantId": {"type": "string"}}}'),
            ('invoice.cancelled', 'Triggered when an invoice is cancelled', 'invoice', '{"type": "object", "properties": {"invoiceId": {"type": "string"}, "invoiceNumber": {"type": "string"}, "tenantId": {"type": "string"}}}'),
            ('tenant.created', 'Triggered when a new tenant is created', 'tenant', '{"type": "object", "properties": {"tenantId": {"type": "string"}, "name": {"type": "string"}, "alias": {"type": "string"}}}'),
            ('tenant.updated', 'Triggered when a tenant is updated', 'tenant', '{"type": "object", "properties": {"tenantId": {"type": "string"}, "name": {"type": "string"}, "alias": {"type": "string"}}}'),
            ('tenant.deleted', 'Triggered when a tenant is deleted', 'tenant', '{"type": "object", "properties": {"tenantId": {"type": "string"}}}')
            ON CONFLICT ("eventType") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_webhook_logs_next_retry"`);
        await queryRunner.query(`DROP INDEX "IDX_webhook_logs_created_at"`);
        await queryRunner.query(`DROP INDEX "IDX_webhook_logs_status"`);
        await queryRunner.query(`DROP INDEX "IDX_webhook_logs_event_type"`);
        await queryRunner.query(`DROP INDEX "IDX_webhook_logs_tenant"`);
        await queryRunner.query(`DROP INDEX "IDX_webhook_logs_webhook"`);
        await queryRunner.query(`DROP INDEX "IDX_webhooks_active"`);
        await queryRunner.query(`DROP INDEX "IDX_webhooks_events"`);
        await queryRunner.query(`DROP INDEX "IDX_webhooks_tenant"`);
        await queryRunner.query(`DROP INDEX "IDX_webhook_events_category"`);
        await queryRunner.query(`DROP INDEX "IDX_webhook_events_tenant"`);
        await queryRunner.query(`DROP INDEX "IDX_webhook_events_event_type"`);

        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "webhook_logs" DROP CONSTRAINT "FK_webhook_logs_tenant"`);
        await queryRunner.query(`ALTER TABLE "webhook_logs" DROP CONSTRAINT "FK_webhook_logs_webhook"`);
        await queryRunner.query(`ALTER TABLE "webhooks" DROP CONSTRAINT "FK_webhooks_tenant"`);
        await queryRunner.query(`ALTER TABLE "webhook_events" DROP CONSTRAINT "FK_webhook_events_tenant"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "webhook_logs"`);
        await queryRunner.query(`DROP TABLE "webhooks"`);
        await queryRunner.query(`DROP TABLE "webhook_events"`);
    }
}