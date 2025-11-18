import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWebhookTables1763457116000 implements MigrationInterface {
    name = 'CreateWebhookTables1763457116000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "webhook_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" character varying(1000), "schema" json, "isActive" boolean NOT NULL DEFAULT true, "tenant_id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_webhook_events" PRIMARY KEY ("id"))`,
        );
        
        await queryRunner.query(
            `CREATE TABLE "webhooks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" character varying(2048) NOT NULL, "method" character varying(10) NOT NULL DEFAULT 'POST', "events" json NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "secret" character varying(255), "headers" json, "retryPolicy" json, "timeout" integer NOT NULL DEFAULT '30000', "maxRetries" integer NOT NULL DEFAULT '3', "tenant_id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_webhooks" PRIMARY KEY ("id"))`,
        );
        
        await queryRunner.query(
            `CREATE TABLE "webhook_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "webhook_id" uuid NOT NULL, "eventType" character varying(255) NOT NULL, "payload" json NOT NULL, "statusCode" integer NOT NULL, "responseBody" text, "errorMessage" text, "retryCount" integer NOT NULL DEFAULT '0', "isSuccess" boolean NOT NULL DEFAULT false, "responseTime" integer, "tenant_id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_webhook_logs" PRIMARY KEY ("id"))`,
        );

        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_webhook_events_name_tenant" ON "webhook_events" ("name", "tenant_id")`,
        );

        await queryRunner.query(
            `CREATE INDEX "IDX_webhooks_tenant_id" ON "webhooks" ("tenant_id")`,
        );

        await queryRunner.query(
            `CREATE INDEX "IDX_webhooks_is_active" ON "webhooks" ("isActive")`,
        );

        await queryRunner.query(
            `CREATE INDEX "IDX_webhook_logs_webhook_id" ON "webhook_logs" ("webhook_id")`,
        );

        await queryRunner.query(
            `CREATE INDEX "IDX_webhook_logs_tenant_id" ON "webhook_logs" ("tenant_id")`,
        );

        await queryRunner.query(
            `CREATE INDEX "IDX_webhook_logs_is_success" ON "webhook_logs" ("isSuccess")`,
        );

        await queryRunner.query(
            `CREATE INDEX "IDX_webhook_logs_created_at" ON "webhook_logs" ("createdAt")`,
        );

        await queryRunner.query(
            `ALTER TABLE "webhook_events" ADD CONSTRAINT "FK_webhook_events_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        
        await queryRunner.query(
            `ALTER TABLE "webhooks" ADD CONSTRAINT "FK_webhooks_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        
        await queryRunner.query(
            `ALTER TABLE "webhook_logs" ADD CONSTRAINT "FK_webhook_logs_webhook" FOREIGN KEY ("webhook_id") REFERENCES "webhooks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        
        await queryRunner.query(
            `ALTER TABLE "webhook_logs" ADD CONSTRAINT "FK_webhook_logs_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "webhook_logs" DROP CONSTRAINT "FK_webhook_logs_tenant"`,
        );
        await queryRunner.query(
            `ALTER TABLE "webhook_logs" DROP CONSTRAINT "FK_webhook_logs_webhook"`,
        );
        await queryRunner.query(
            `ALTER TABLE "webhooks" DROP CONSTRAINT "FK_webhooks_tenant"`,
        );
        await queryRunner.query(
            `ALTER TABLE "webhook_events" DROP CONSTRAINT "FK_webhook_events_tenant"`,
        );

        await queryRunner.query(
            `DROP INDEX "IDX_webhook_logs_created_at"`,
        );
        await queryRunner.query(
            `DROP INDEX "IDX_webhook_logs_is_success"`,
        );
        await queryRunner.query(
            `DROP INDEX "IDX_webhook_logs_tenant_id"`,
        );
        await queryRunner.query(
            `DROP INDEX "IDX_webhook_logs_webhook_id"`,
        );
        await queryRunner.query(
            `DROP INDEX "IDX_webhooks_is_active"`,
        );
        await queryRunner.query(
            `DROP INDEX "IDX_webhooks_tenant_id"`,
        );
        await queryRunner.query(
            `DROP INDEX "IDX_webhook_events_name_tenant"`,
        );

        await queryRunner.query(`DROP TABLE "webhook_logs"`);
        await queryRunner.query(`DROP TABLE "webhooks"`);
        await queryRunner.query(`DROP TABLE "webhook_events"`);
    }
}