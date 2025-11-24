import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeams1750000000000 implements MigrationInterface {
    name = 'CreateTeams1750000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "teams" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" character varying(500) NOT NULL, "tenant_id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "team_users" ("team_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7477" PRIMARY KEY ("team_id", "user_id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_fdcdb11b308e0ca5a23dc7c5f5" ON "team_users" ("team_id") `,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_b0c0ccb90de055124e26f2dd65" ON "team_users" ("user_id") `,
        );
        await queryRunner.query(
            `ALTER TABLE "teams" ADD CONSTRAINT "FK_8c3f8e3c1e5f7f3b6c8e4a5e2e1" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_users" ADD CONSTRAINT "FK_fdcdb11b308e0ca5a23dc7c5f5" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_users" ADD CONSTRAINT "FK_b0c0ccb90de055124e26f2dd65" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "team_users" DROP CONSTRAINT IF EXISTS "FK_b0c0ccb90de055124e26f2dd65"`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_users" DROP CONSTRAINT IF EXISTS "FK_fdcdb11b308e0ca5a23dc7c5f5"`,
        );
        await queryRunner.query(
            `ALTER TABLE "teams" DROP CONSTRAINT IF EXISTS "FK_8c3f8e3c1e5f7f3b6c8e4a5e2e1"`,
        );
        await queryRunner.query(
            `DROP INDEX IF EXISTS "IDX_b0c0ccb90de055124e26f2dd65"`,
        );
        await queryRunner.query(
            `DROP INDEX IF EXISTS "IDX_fdcdb11b308e0ca5a23dc7c5f5"`,
        );
        await queryRunner.query(`DROP TABLE IF EXISTS "team_users"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "teams"`);
    }
}