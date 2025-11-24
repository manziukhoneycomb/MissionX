import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamsTables1764010520000 implements MigrationInterface {
    name = 'CreateTeamsTables1764010520000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "teams" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text, "tenant_id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "team_users" ("team_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_c2d4e621c102d1b2fb93c99b6e2" PRIMARY KEY ("team_id", "user_id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_5e0cd1fa37ec3bd2e62f63b38a" ON "team_users" ("team_id") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_2e5e9b7e0b657cb8a5cf0e9a59" ON "team_users" ("user_id") `,
        );
        await queryRunner.query(
            `ALTER TABLE "teams" ADD CONSTRAINT "FK_fcb0ce8a0f88e2e9c99ebe0c903" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_users" ADD CONSTRAINT "FK_5e0cd1fa37ec3bd2e62f63b38a0" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_users" ADD CONSTRAINT "FK_2e5e9b7e0b657cb8a5cf0e9a594" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "team_users" DROP CONSTRAINT "FK_2e5e9b7e0b657cb8a5cf0e9a594"`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_users" DROP CONSTRAINT "FK_5e0cd1fa37ec3bd2e62f63b38a0"`,
        );
        await queryRunner.query(
            `ALTER TABLE "teams" DROP CONSTRAINT "FK_fcb0ce8a0f88e2e9c99ebe0c903"`,
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_2e5e9b7e0b657cb8a5cf0e9a59"`,
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_5e0cd1fa37ec3bd2e62f63b38a"`,
        );
        await queryRunner.query(`DROP TABLE "team_users"`);
        await queryRunner.query(`DROP TABLE "teams"`);
    }
}