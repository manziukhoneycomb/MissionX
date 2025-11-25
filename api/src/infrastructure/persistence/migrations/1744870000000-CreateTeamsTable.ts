import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamsTable1744870000000 implements MigrationInterface {
    name = 'CreateTeamsTable1744870000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "teams" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text, "tenant_id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7e5523774d38b08f6236a5ea0d8" PRIMARY KEY ("id"))`
        );
        
        await queryRunner.query(
            `CREATE TABLE "teams_users" ("team_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_c6de8b8af1c2e1bee7c4ad93e9c" PRIMARY KEY ("team_id", "user_id"))`
        );
        
        await queryRunner.query(
            `CREATE INDEX "IDX_8c49be7e1b6b47d4e4dd8f4be9" ON "teams_users" ("team_id")`
        );
        
        await queryRunner.query(
            `CREATE INDEX "IDX_4a3b1d72fb7a2b60e7f5b8d6f9" ON "teams_users" ("user_id")`
        );
        
        await queryRunner.query(
            `ALTER TABLE "teams" ADD CONSTRAINT "FK_teams_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
        
        await queryRunner.query(
            `ALTER TABLE "teams_users" ADD CONSTRAINT "FK_teams_users_team_id" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );
        
        await queryRunner.query(
            `ALTER TABLE "teams_users" ADD CONSTRAINT "FK_teams_users_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "teams_users" DROP CONSTRAINT "FK_teams_users_user_id"`
        );
        
        await queryRunner.query(
            `ALTER TABLE "teams_users" DROP CONSTRAINT "FK_teams_users_team_id"`
        );
        
        await queryRunner.query(
            `ALTER TABLE "teams" DROP CONSTRAINT "FK_teams_tenant_id"`
        );
        
        await queryRunner.query(
            `DROP INDEX "public"."IDX_4a3b1d72fb7a2b60e7f5b8d6f9"`
        );
        
        await queryRunner.query(
            `DROP INDEX "public"."IDX_8c49be7e1b6b47d4e4dd8f4be9"`
        );
        
        await queryRunner.query(`DROP TABLE "teams_users"`);
        
        await queryRunner.query(`DROP TABLE "teams"`);
    }
}