import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamsTable1763942400000 implements MigrationInterface {
    name = 'CreateTeamsTable1763942400000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "teams" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text, "tenant_id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "team_users" ("team_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_e7379d332997d39a032890526ea" PRIMARY KEY ("team_id", "user_id"))`,
        );
        await queryRunner.query(`CREATE INDEX "IDX_53805856e0e919539b5b766a2b" ON "team_users" ("team_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_7f5e31b7904423871038b556b5" ON "team_users" ("user_id") `);
        await queryRunner.query(
            `ALTER TABLE "teams" ADD CONSTRAINT "FK_56de7718664a387987cb1e5b56b" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_users" ADD CONSTRAINT "FK_53805856e0e919539b5b766a2b7" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_users" ADD CONSTRAINT "FK_7f5e31b7904423871038b556b59" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team_users" DROP CONSTRAINT "FK_7f5e31b7904423871038b556b59"`);
        await queryRunner.query(`ALTER TABLE "team_users" DROP CONSTRAINT "FK_53805856e0e919539b5b766a2b7"`);
        await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "FK_56de7718664a387987cb1e5b56b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7f5e31b7904423871038b556b5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_53805856e0e919539b5b766a2b"`);
        await queryRunner.query(`DROP TABLE "team_users"`);
        await queryRunner.query(`DROP TABLE "teams"`);
    }
}
