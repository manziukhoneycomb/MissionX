import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWebhookEntities1731949200000 implements MigrationInterface {
    name = 'CreateWebhookEntities1731949200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."webhook_logs_status_enum" AS ENUM('pending', 'success', 'failed', 'retrying')
        `);

        await queryRunner.query(`
            CREATE TABLE "webhooks" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "url" character varying(500) NOT NULL,
                "method" character varying(10) NOT NULL DEFAULT 'POST',
                "events" text NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "secret" character varying(255),
                "headers" text,
                "retry_policy" text,
                "timeout" integer NOT NULL DEFAULT '30000',
                "max_retries" integer NOT NULL DEFAULT '3',
                "tenant_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_webhooks_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "webhook_events" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "eventType" character varying(100) NOT NULL,
                "description" character varying(500),
                "is_active" boolean NOT NULL DEFAULT true,
                "payload" text,
                "webhook_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_webhook_events_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "webhook_logs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "status" "public"."webhook_logs_status_enum" NOT NULL DEFAULT 'pending',
                "event_type" character varying(100) NOT NULL,
                "payload" text,
                "response_status" integer,
                "response_body" text,
                "response_headers" text,
                "error_message" text,
                "attempt_count" integer NOT NULL DEFAULT '0',
                "next_retry_at" TIMESTAMP,
                "webhook_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_webhook_logs_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "webhooks" 
            ADD CONSTRAINT "FK_webhooks_tenant_id" 
            FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "webhook_events" 
            ADD CONSTRAINT "FK_webhook_events_webhook_id" 
            FOREIGN KEY ("webhook_id") REFERENCES "webhooks"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "webhook_logs" 
            ADD CONSTRAINT "FK_webhook_logs_webhook_id" 
            FOREIGN KEY ("webhook_id") REFERENCES "webhooks"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_webhooks_tenant_id" ON "webhooks" ("tenant_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_webhooks_is_active" ON "webhooks" ("is_active")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_webhook_events_webhook_id" ON "webhook_events" ("webhook_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_webhook_logs_webhook_id" ON "webhook_logs" ("webhook_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_webhook_logs_status" ON "webhook_logs" ("status")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_webhook_logs_next_retry_at" ON "webhook_logs" ("next_retry_at")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_webhook_logs_next_retry_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_webhook_logs_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_webhook_logs_webhook_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_webhook_events_webhook_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_webhooks_is_active"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_webhooks_tenant_id"`);

        await queryRunner.query(`ALTER TABLE "webhook_logs" DROP CONSTRAINT "FK_webhook_logs_webhook_id"`);
        await queryRunner.query(`ALTER TABLE "webhook_events" DROP CONSTRAINT "FK_webhook_events_webhook_id"`);
        await queryRunner.query(`ALTER TABLE "webhooks" DROP CONSTRAINT "FK_webhooks_tenant_id"`);

        await queryRunner.query(`DROP TABLE "webhook_logs"`);
        await queryRunner.query(`DROP TABLE "webhook_events"`);
        await queryRunner.query(`DROP TABLE "webhooks"`);

        await queryRunner.query(`DROP TYPE "public"."webhook_logs_status_enum"`);
    }
}