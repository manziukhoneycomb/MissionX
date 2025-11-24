import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamsTable1748426000000 implements MigrationInterface {
    name = 'CreateTeamsTable1748426000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "teams" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "description" text,
                "tenant_id" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_7e5523eb6d2e2dd2289480674ef" PRIMARY KEY ("id")
            )`
        );

        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "team_users" (
                "team_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                CONSTRAINT "PK_93051fe759e57b2025f01d8130f" PRIMARY KEY ("team_id", "user_id")
            )`
        );

        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_20c56123696378744fb724310a" ON "team_users" ("team_id")`
        );

        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_a2f2a44969a8c4608e5d447ef6" ON "team_users" ("user_id")`
        );

        await queryRunner.query(
            `ALTER TABLE "teams" ADD CONSTRAINT "FK_48c375e127921654b47759860f3" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );

        await queryRunner.query(
            `ALTER TABLE "team_users" ADD CONSTRAINT "FK_20c56123696378744fb724310a3" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );

        await queryRunner.query(
            `ALTER TABLE "team_users" ADD CONSTRAINT "FK_a2f2a44969a8c4608e5d447ef66" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "team_users" DROP CONSTRAINT "FK_a2f2a44969a8c4608e5d447ef66"`
        );
        await queryRunner.query(
            `ALTER TABLE "team_users" DROP CONSTRAINT "FK_20c56123696378744fb724310a3"`
        );
        await queryRunner.query(
            `ALTER TABLE "teams" DROP CONSTRAINT "FK_48c375e127921654b47759860f3"`
        );
        await queryRunner.query(`DROP INDEX "IDX_a2f2a44969a8c4608e5d447ef6"`);
        await queryRunner.query(`DROP INDEX "IDX_20c56123696378744fb724310a"`);
        await queryRunner.query(`DROP TABLE "team_users"`);
        await queryRunner.query(`DROP TABLE "teams"`);
    }
}
