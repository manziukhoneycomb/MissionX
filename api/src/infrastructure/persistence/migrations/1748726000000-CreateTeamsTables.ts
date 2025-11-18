import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamsTables1748726000000 implements MigrationInterface {
    name = 'CreateTeamsTables1748726000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create team_role_name enum
        await queryRunner.query(
            `CREATE TYPE "team_role_name_enum" AS ENUM('Team Owner', 'Team Admin', 'Team Member')`
        );

        // Create teams table
        await queryRunner.query(
            `CREATE TABLE "teams" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "name" character varying(255) NOT NULL, 
                "description" character varying(500), 
                "isActive" boolean NOT NULL DEFAULT true, 
                "tenant_id" uuid NOT NULL, 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_7e5523774a38b08a6236a322b73" PRIMARY KEY ("id")
            )`
        );

        // Create team_members junction table
        await queryRunner.query(
            `CREATE TABLE "team_members" (
                "team_id" uuid NOT NULL, 
                "user_id" uuid NOT NULL, 
                CONSTRAINT "PK_team_members" PRIMARY KEY ("team_id", "user_id")
            )`
        );

        // Create team_member_roles table
        await queryRunner.query(
            `CREATE TABLE "team_member_roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "team_id" uuid NOT NULL, 
                "user_id" uuid NOT NULL, 
                "roleName" "team_role_name_enum" NOT NULL, 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_team_member_roles" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_team_user" UNIQUE ("team_id", "user_id")
            )`
        );

        // Add foreign key constraints
        await queryRunner.query(
            `ALTER TABLE "teams" ADD CONSTRAINT "FK_teams_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );

        await queryRunner.query(
            `ALTER TABLE "team_members" ADD CONSTRAINT "FK_team_members_team" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );

        await queryRunner.query(
            `ALTER TABLE "team_members" ADD CONSTRAINT "FK_team_members_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );

        await queryRunner.query(
            `ALTER TABLE "team_member_roles" ADD CONSTRAINT "FK_team_member_roles_team" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );

        await queryRunner.query(
            `ALTER TABLE "team_member_roles" ADD CONSTRAINT "FK_team_member_roles_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "team_member_roles" DROP CONSTRAINT "FK_team_member_roles_user"`);
        await queryRunner.query(`ALTER TABLE "team_member_roles" DROP CONSTRAINT "FK_team_member_roles_team"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "FK_team_members_user"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "FK_team_members_team"`);
        await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "FK_teams_tenant"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "team_member_roles"`);
        await queryRunner.query(`DROP TABLE "team_members"`);
        await queryRunner.query(`DROP TABLE "teams"`);

        // Drop enum
        await queryRunner.query(`DROP TYPE "team_role_name_enum"`);
    }
}