import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamTables1744809500000 implements MigrationInterface {
    name = 'CreateTeamTables1744809500000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "teams" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "description" text,
                "tenant_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_teams_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "team_members" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "team_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                "role_id" uuid NOT NULL,
                "joined_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_team_members_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_team_members_team_user" UNIQUE ("team_id", "user_id")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_team_members_team_id" ON "team_members" ("team_id")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_team_members_user_id" ON "team_members" ("user_id")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_teams_tenant_id" ON "teams" ("tenant_id")
        `);

        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "IDX_teams_name_tenant" ON "teams" ("name", "tenant_id")
        `);

        await queryRunner.query(`
            ALTER TABLE "teams" 
            ADD CONSTRAINT IF NOT EXISTS "FK_teams_tenant_id" 
            FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "team_members" 
            ADD CONSTRAINT IF NOT EXISTS "FK_team_members_team_id" 
            FOREIGN KEY ("team_id") REFERENCES "teams"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "team_members" 
            ADD CONSTRAINT IF NOT EXISTS "FK_team_members_user_id" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "team_members" 
            ADD CONSTRAINT IF NOT EXISTS "FK_team_members_role_id" 
            FOREIGN KEY ("role_id") REFERENCES "roles"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "roles" 
            ADD CONSTRAINT IF NOT EXISTS "UQ_roles_name_team_id" 
            UNIQUE ("name", "team_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "roles" 
            DROP CONSTRAINT IF EXISTS "UQ_roles_name_team_id"
        `);

        await queryRunner.query(`
            ALTER TABLE "team_members" 
            DROP CONSTRAINT IF EXISTS "FK_team_members_role_id"
        `);

        await queryRunner.query(`
            ALTER TABLE "team_members" 
            DROP CONSTRAINT IF EXISTS "FK_team_members_user_id"
        `);

        await queryRunner.query(`
            ALTER TABLE "team_members" 
            DROP CONSTRAINT IF EXISTS "FK_team_members_team_id"
        `);

        await queryRunner.query(`
            ALTER TABLE "teams" 
            DROP CONSTRAINT IF EXISTS "FK_teams_tenant_id"
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_teams_name_tenant"
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_teams_tenant_id"
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_team_members_user_id"
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_team_members_team_id"
        `);

        await queryRunner.query(`
            DROP TABLE IF EXISTS "team_members"
        `);

        await queryRunner.query(`
            DROP TABLE IF EXISTS "teams"
        `);
    }
}
