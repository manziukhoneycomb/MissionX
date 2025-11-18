import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTasksTable1748512345678 implements MigrationInterface {
    name = 'CreateTasksTable1748512345678';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."tasks_status_enum" AS ENUM('new', 'active', 'in_progress', 'resolved', 'closed')`
        );
        await queryRunner.query(
            `CREATE TYPE "public"."tasks_priority_enum" AS ENUM('1', '2', '3', '4')`
        );
        await queryRunner.query(
            `CREATE TABLE "tasks" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying(255) NOT NULL,
                "description" text,
                "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'new',
                "priority" "public"."tasks_priority_enum" NOT NULL DEFAULT '2',
                "assignee_id" uuid,
                "project_id" character varying(255),
                "external_id" character varying(255),
                "tenant_id" uuid NOT NULL,
                "metadata" json,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_tasks_external_id" UNIQUE ("external_id"),
                CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id")
            )`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_tasks_tenant_id" ON "tasks" ("tenant_id")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_tasks_assignee_id" ON "tasks" ("assignee_id")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_tasks_project_id" ON "tasks" ("project_id")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_tasks_external_id" ON "tasks" ("external_id")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_tasks_status" ON "tasks" ("status")`
        );
        await queryRunner.query(
            `ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_assignee_id" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_tenant_id"`
        );
        await queryRunner.query(
            `ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_assignee_id"`
        );
        await queryRunner.query(`DROP INDEX "public"."IDX_tasks_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_tasks_external_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_tasks_project_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_tasks_assignee_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_tasks_tenant_id"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
    }
}