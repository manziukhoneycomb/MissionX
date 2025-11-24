import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamsTable1748500000000 implements MigrationInterface {
    name = 'CreateTeamsTable1748500000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create teams table
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "teams" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "description" text,
                "tenant_id" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_teams_id" PRIMARY KEY ("id")
            )`
        );

        // Add foreign key for tenant safely
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_teams_tenant') THEN
                    ALTER TABLE "teams" ADD CONSTRAINT "FK_teams_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE;
                END IF;
            END $$;
        `);

        // Create team_users join table
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "team_users" (
                "team_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                CONSTRAINT "PK_team_users" PRIMARY KEY ("team_id", "user_id")
            )`
        );

        // Add foreign keys for team_users safely
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_team_users_team') THEN
                    ALTER TABLE "team_users" ADD CONSTRAINT "FK_team_users_team" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE;
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_team_users_user') THEN
                    ALTER TABLE "team_users" ADD CONSTRAINT "FK_team_users_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team_users" DROP CONSTRAINT IF EXISTS "FK_team_users_user"`);
        await queryRunner.query(`ALTER TABLE "team_users" DROP CONSTRAINT IF EXISTS "FK_team_users_team"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "team_users"`);
        await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT IF EXISTS "FK_teams_tenant"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "teams"`);
    }
}
