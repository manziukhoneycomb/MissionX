import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamsTable1748426000000 implements MigrationInterface {
    name = 'CreateTeamsTable1748426000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const teamsTableExists = await queryRunner.hasTable('teams');
        if (!teamsTableExists) {
            await queryRunner.query(
                `CREATE TABLE "teams" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                    "name" character varying(255) NOT NULL, 
                    "description" text, 
                    "tenant_id" uuid NOT NULL, 
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
                    CONSTRAINT "PK_teams_id" PRIMARY KEY ("id")
                )`,
            );
        }

        const teamMembersTableExists = await queryRunner.hasTable('team_members');
        if (!teamMembersTableExists) {
            await queryRunner.query(
                `CREATE TABLE "team_members" (
                    "team_id" uuid NOT NULL, 
                    "user_id" uuid NOT NULL, 
                    CONSTRAINT "PK_team_members" PRIMARY KEY ("team_id", "user_id")
                )`,
            );

            await queryRunner.query(
                `CREATE INDEX "IDX_team_members_team_id" ON "team_members" ("team_id")`,
            );

            await queryRunner.query(
                `CREATE INDEX "IDX_team_members_user_id" ON "team_members" ("user_id")`,
            );
        }

        const teamsTenantFkExists = await queryRunner.query(
            `SELECT constraint_name 
             FROM information_schema.table_constraints 
             WHERE table_name = 'teams' 
             AND constraint_name = 'FK_teams_tenant_id'`,
        );
        if (!teamsTenantFkExists || teamsTenantFkExists.length === 0) {
            await queryRunner.query(
                `ALTER TABLE "teams" 
                 ADD CONSTRAINT "FK_teams_tenant_id" 
                 FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") 
                 ON DELETE CASCADE ON UPDATE NO ACTION`,
            );
        }

        const teamMembersTeamFkExists = await queryRunner.query(
            `SELECT constraint_name 
             FROM information_schema.table_constraints 
             WHERE table_name = 'team_members' 
             AND constraint_name = 'FK_team_members_team_id'`,
        );
        if (!teamMembersTeamFkExists || teamMembersTeamFkExists.length === 0) {
            await queryRunner.query(
                `ALTER TABLE "team_members" 
                 ADD CONSTRAINT "FK_team_members_team_id" 
                 FOREIGN KEY ("team_id") REFERENCES "teams"("id") 
                 ON DELETE CASCADE ON UPDATE CASCADE`,
            );
        }

        const teamMembersUserFkExists = await queryRunner.query(
            `SELECT constraint_name 
             FROM information_schema.table_constraints 
             WHERE table_name = 'team_members' 
             AND constraint_name = 'FK_team_members_user_id'`,
        );
        if (!teamMembersUserFkExists || teamMembersUserFkExists.length === 0) {
            await queryRunner.query(
                `ALTER TABLE "team_members" 
                 ADD CONSTRAINT "FK_team_members_user_id" 
                 FOREIGN KEY ("user_id") REFERENCES "users"("id") 
                 ON DELETE CASCADE ON UPDATE CASCADE`,
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const teamMembersUserFkExists = await queryRunner.query(
            `SELECT constraint_name 
             FROM information_schema.table_constraints 
             WHERE table_name = 'team_members' 
             AND constraint_name = 'FK_team_members_user_id'`,
        );
        if (teamMembersUserFkExists && teamMembersUserFkExists.length > 0) {
            await queryRunner.query(
                `ALTER TABLE "team_members" DROP CONSTRAINT "FK_team_members_user_id"`,
            );
        }

        const teamMembersTeamFkExists = await queryRunner.query(
            `SELECT constraint_name 
             FROM information_schema.table_constraints 
             WHERE table_name = 'team_members' 
             AND constraint_name = 'FK_team_members_team_id'`,
        );
        if (teamMembersTeamFkExists && teamMembersTeamFkExists.length > 0) {
            await queryRunner.query(
                `ALTER TABLE "team_members" DROP CONSTRAINT "FK_team_members_team_id"`,
            );
        }

        const teamsTenantFkExists = await queryRunner.query(
            `SELECT constraint_name 
             FROM information_schema.table_constraints 
             WHERE table_name = 'teams' 
             AND constraint_name = 'FK_teams_tenant_id'`,
        );
        if (teamsTenantFkExists && teamsTenantFkExists.length > 0) {
            await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "FK_teams_tenant_id"`);
        }

        const teamMembersTableExists = await queryRunner.hasTable('team_members');
        if (teamMembersTableExists) {
            await queryRunner.query(`DROP TABLE "team_members"`);
        }

        const teamsTableExists = await queryRunner.hasTable('teams');
        if (teamsTableExists) {
            await queryRunner.query(`DROP TABLE "teams"`);
        }
    }
}
