import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTasksTable1744809600000 implements MigrationInterface {
    name = 'CreateTasksTable1744809600000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "task_status_enum" AS ENUM('New', 'Active', 'Resolved', 'Closed', 'Removed')
        `);

        await queryRunner.query(`
            CREATE TYPE "task_priority_enum" AS ENUM('1', '2', '3', '4')
        `);

        await queryRunner.query(`
            CREATE TABLE "tasks" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying(255) NOT NULL,
                "description" text,
                "status" "task_status_enum" NOT NULL DEFAULT 'New',
                "priority" "task_priority_enum" NOT NULL DEFAULT '2',
                "azure_devops_id" integer,
                "azure_devops_url" character varying,
                "azure_devops_rev" integer,
                "last_sync_at" TIMESTAMP,
                "sync_error" text,
                "tenant_id" uuid NOT NULL,
                "assigned_user_id" uuid,
                "created_by_id" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_tasks_tenant_id" ON "tasks" ("tenant_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_tasks_assigned_user_id" ON "tasks" ("assigned_user_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_tasks_azure_devops_id" ON "tasks" ("azure_devops_id")
        `);

        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_tasks_azure_devops_id_tenant" ON "tasks" ("azure_devops_id", "tenant_id") WHERE "azure_devops_id" IS NOT NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_tenant_id" 
            FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_assigned_user_id" 
            FOREIGN KEY ("assigned_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_created_by_id" 
            FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_created_by_id"
        `);

        await queryRunner.query(`
            ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_assigned_user_id"
        `);

        await queryRunner.query(`
            ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_tenant_id"
        `);

        await queryRunner.query(`
            DROP INDEX "IDX_tasks_azure_devops_id_tenant"
        `);

        await queryRunner.query(`
            DROP INDEX "IDX_tasks_azure_devops_id"
        `);

        await queryRunner.query(`
            DROP INDEX "IDX_tasks_assigned_user_id"
        `);

        await queryRunner.query(`
            DROP INDEX "IDX_tasks_tenant_id"
        `);

        await queryRunner.query(`
            DROP TABLE "tasks"
        `);

        await queryRunner.query(`
            DROP TYPE "task_priority_enum"
        `);

        await queryRunner.query(`
            DROP TYPE "task_status_enum"
        `);
    }
}