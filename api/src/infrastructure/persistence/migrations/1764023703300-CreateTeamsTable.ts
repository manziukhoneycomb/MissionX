import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamsTable1764023703300 implements MigrationInterface {
    name = 'CreateTeamsTable1764023703300';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const teamsTableExists = await queryRunner.hasTable('teams');
        if (!teamsTableExists) {
            await queryRunner.query(
                `CREATE TABLE "teams" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text, "tenant_id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY ("id"))`,
            );
        }

        const teamsUsersTableExists = await queryRunner.hasTable('teams_users');
        if (!teamsUsersTableExists) {
            await queryRunner.query(
                `CREATE TABLE "teams_users" ("team_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_ce3fce7f8fa2f7a2c707f565c5c" PRIMARY KEY ("team_id", "user_id"))`,
            );
            await queryRunner.query(
                `CREATE INDEX "IDX_team_id" ON "teams_users" ("team_id")`,
            );
            await queryRunner.query(
                `CREATE INDEX "IDX_user_id" ON "teams_users" ("user_id")`,
            );
        }

        const teamsTenantFKExists = await queryRunner.query(
            `SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'teams' AND constraint_name = 'FK_teams_tenant_id'`,
        );
        if (teamsTenantFKExists.length === 0) {
            await queryRunner.query(
                `ALTER TABLE "teams" ADD CONSTRAINT "FK_teams_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
            );
        }

        const teamsUsersTeamFKExists = await queryRunner.query(
            `SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'teams_users' AND constraint_name = 'FK_teams_users_team_id'`,
        );
        if (teamsUsersTeamFKExists.length === 0) {
            await queryRunner.query(
                `ALTER TABLE "teams_users" ADD CONSTRAINT "FK_teams_users_team_id" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
            );
        }

        const teamsUsersUserFKExists = await queryRunner.query(
            `SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'teams_users' AND constraint_name = 'FK_teams_users_user_id'`,
        );
        if (teamsUsersUserFKExists.length === 0) {
            await queryRunner.query(
                `ALTER TABLE "teams_users" ADD CONSTRAINT "FK_teams_users_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const teamsUsersUserFKExists = await queryRunner.query(
            `SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'teams_users' AND constraint_name = 'FK_teams_users_user_id'`,
        );
        if (teamsUsersUserFKExists.length > 0) {
            await queryRunner.query(
                `ALTER TABLE "teams_users" DROP CONSTRAINT "FK_teams_users_user_id"`,
            );
        }

        const teamsUsersTeamFKExists = await queryRunner.query(
            `SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'teams_users' AND constraint_name = 'FK_teams_users_team_id'`,
        );
        if (teamsUsersTeamFKExists.length > 0) {
            await queryRunner.query(
                `ALTER TABLE "teams_users" DROP CONSTRAINT "FK_teams_users_team_id"`,
            );
        }

        const teamsTenantFKExists = await queryRunner.query(
            `SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'teams' AND constraint_name = 'FK_teams_tenant_id'`,
        );
        if (teamsTenantFKExists.length > 0) {
            await queryRunner.query(
                `ALTER TABLE "teams" DROP CONSTRAINT "FK_teams_tenant_id"`,
            );
        }

        const userIdIndexExists = await queryRunner.query(
            `SELECT indexname FROM pg_indexes WHERE tablename = 'teams_users' AND indexname = 'IDX_user_id'`,
        );
        if (userIdIndexExists.length > 0) {
            await queryRunner.query(`DROP INDEX "IDX_user_id"`);
        }

        const teamIdIndexExists = await queryRunner.query(
            `SELECT indexname FROM pg_indexes WHERE tablename = 'teams_users' AND indexname = 'IDX_team_id'`,
        );
        if (teamIdIndexExists.length > 0) {
            await queryRunner.query(`DROP INDEX "IDX_team_id"`);
        }

        const teamsUsersTableExists = await queryRunner.hasTable('teams_users');
        if (teamsUsersTableExists) {
            await queryRunner.query(`DROP TABLE "teams_users"`);
        }

        const teamsTableExists = await queryRunner.hasTable('teams');
        if (teamsTableExists) {
            await queryRunner.query(`DROP TABLE "teams"`);
        }
    }
}