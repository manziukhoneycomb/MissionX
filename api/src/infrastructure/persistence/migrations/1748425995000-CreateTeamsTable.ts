import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamsTable1748425995000 implements MigrationInterface {
    name = 'CreateTeamsTable1748425995000';

    public async up(queryRunner: QueryRunner): Promise<void> {
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

        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "team_users" (
                "team_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                CONSTRAINT "PK_team_users" PRIMARY KEY ("team_id", "user_id")
            )`
        );

        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_team_users_team_id" ON "team_users" ("team_id")`
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_team_users_user_id" ON "team_users" ("user_id")`
        );

        await queryRunner.query(
            `ALTER TABLE "teams" ADD CONSTRAINT "FK_teams_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );

        await queryRunner.query(
            `ALTER TABLE "team_users" ADD CONSTRAINT "FK_team_users_team_id" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );

        await queryRunner.query(
            `ALTER TABLE "team_users" ADD CONSTRAINT "FK_team_users_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "team_users" DROP CONSTRAINT IF EXISTS "FK_team_users_user_id"`
        );
        await queryRunner.query(
            `ALTER TABLE "team_users" DROP CONSTRAINT IF EXISTS "FK_team_users_team_id"`
        );
        await queryRunner.query(
            `ALTER TABLE "teams" DROP CONSTRAINT IF EXISTS "FK_teams_tenant_id"`
        );
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_team_users_user_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_team_users_team_id"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "team_users"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "teams"`);
    }
}
