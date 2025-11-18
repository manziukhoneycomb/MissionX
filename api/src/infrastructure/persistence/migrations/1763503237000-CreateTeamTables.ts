import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamTables1763503237000 implements MigrationInterface {
    name = 'CreateTeamTables1763503237000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update roles enum to include team roles
        await queryRunner.query(
            `ALTER TYPE "public"."roles_name_enum" ADD VALUE 'Team Owner'`
        );
        await queryRunner.query(
            `ALTER TYPE "public"."roles_name_enum" ADD VALUE 'Team Admin'`
        );
        await queryRunner.query(
            `ALTER TYPE "public"."roles_name_enum" ADD VALUE 'Team Member'`
        );

        // Create teams table
        await queryRunner.query(
            `CREATE TABLE "teams" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "name" character varying(255) NOT NULL, 
                "description" text, 
                "tenant_id" uuid NOT NULL, 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "deletedAt" TIMESTAMP, 
                CONSTRAINT "PK_7e5523774d78dcdda31a43c45e9" PRIMARY KEY ("id")
            )`
        );

        // Create team_roles table
        await queryRunner.query(
            `CREATE TABLE "team_roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "team_id" uuid NOT NULL, 
                "user_id" uuid NOT NULL, 
                "role" "public"."roles_name_enum" NOT NULL DEFAULT 'Team Member', 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "UQ_team_roles_team_user" UNIQUE ("team_id", "user_id"), 
                CONSTRAINT "PK_team_roles_id" PRIMARY KEY ("id")
            )`
        );

        // Add indexes for performance
        await queryRunner.query(
            `CREATE INDEX "IDX_teams_tenant_id" ON "teams" ("tenant_id")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_teams_created_at" ON "teams" ("createdAt")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_team_roles_team_id" ON "team_roles" ("team_id")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_team_roles_user_id" ON "team_roles" ("user_id")`
        );

        // Add foreign key constraints
        await queryRunner.query(
            `ALTER TABLE "teams" ADD CONSTRAINT "FK_teams_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "team_roles" ADD CONSTRAINT "FK_team_roles_team_id" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );
        await queryRunner.query(
            `ALTER TABLE "team_roles" ADD CONSTRAINT "FK_team_roles_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(
            `ALTER TABLE "team_roles" DROP CONSTRAINT "FK_team_roles_user_id"`
        );
        await queryRunner.query(
            `ALTER TABLE "team_roles" DROP CONSTRAINT "FK_team_roles_team_id"`
        );
        await queryRunner.query(
            `ALTER TABLE "teams" DROP CONSTRAINT "FK_teams_tenant_id"`
        );

        // Drop indexes
        await queryRunner.query(`DROP INDEX "public"."IDX_team_roles_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_team_roles_team_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_teams_created_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_teams_tenant_id"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "team_roles"`);
        await queryRunner.query(`DROP TABLE "teams"`);

        // Note: We don't remove the enum values as other data might depend on them
        // and PostgreSQL doesn't support removing enum values easily
    }
}