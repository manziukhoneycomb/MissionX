import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamsTables1748425994517 implements MigrationInterface {
    name = 'CreateTeamsTables1748425994517';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "teams" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text, "tenant_id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "team_members" ("team_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_team_members" PRIMARY KEY ("team_id", "user_id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_team_members_team_id" ON "team_members" ("team_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_team_members_user_id" ON "team_members" ("user_id")`,
        );
        await queryRunner.query(
            `DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'FK_teams_tenant_id'
                ) THEN
                    ALTER TABLE "teams" ADD CONSTRAINT "FK_teams_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
                END IF;
            END $$;`,
        );
        await queryRunner.query(
            `DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'FK_team_members_team_id'
                ) THEN
                    ALTER TABLE "team_members" ADD CONSTRAINT "FK_team_members_team_id" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END $$;`,
        );
        await queryRunner.query(
            `DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'FK_team_members_user_id'
                ) THEN
                    ALTER TABLE "team_members" ADD CONSTRAINT "FK_team_members_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END $$;`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "team_members" DROP CONSTRAINT IF EXISTS "FK_team_members_user_id"`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_members" DROP CONSTRAINT IF EXISTS "FK_team_members_team_id"`,
        );
        await queryRunner.query(
            `ALTER TABLE "teams" DROP CONSTRAINT IF EXISTS "FK_teams_tenant_id"`,
        );
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_team_members_user_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_team_members_team_id"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "team_members"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "teams"`);
    }
}
