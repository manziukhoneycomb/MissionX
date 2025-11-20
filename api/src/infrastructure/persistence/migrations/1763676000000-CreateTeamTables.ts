import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamTables1763676000000 implements MigrationInterface {
    name = 'CreateTeamTables1763676000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create teams table
        await queryRunner.query(`
            CREATE TABLE "teams" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "description" text,
                "tenant_id" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_teams_name_tenant" UNIQUE ("name", "tenant_id")
            )
        `);

        // Create team_roles table
        await queryRunner.query(`
            CREATE TABLE "team_roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "team_id" uuid NOT NULL,
                "name" character varying(100) NOT NULL,
                "permissions" json,
                "inherit_from_global_role" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_4d682873a391d93b0e5fe2f082f" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_team_roles_name_team" UNIQUE ("name", "team_id")
            )
        `);

        // Create team_members table
        await queryRunner.query(`
            CREATE TABLE "team_members" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "team_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                "team_role_id" uuid,
                "joined_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_fdad7503c91abde506bae70349a" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_team_members_team_user" UNIQUE ("team_id", "user_id")
            )
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "teams" 
            ADD CONSTRAINT "FK_teams_tenant_id" 
            FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "team_roles" 
            ADD CONSTRAINT "FK_team_roles_team_id" 
            FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "team_members" 
            ADD CONSTRAINT "FK_team_members_team_id" 
            FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "team_members" 
            ADD CONSTRAINT "FK_team_members_user_id" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "team_members" 
            ADD CONSTRAINT "FK_team_members_team_role_id" 
            FOREIGN KEY ("team_role_id") REFERENCES "team_roles"("id") ON DELETE SET NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "FK_team_members_team_role_id"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "FK_team_members_user_id"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "FK_team_members_team_id"`);
        await queryRunner.query(`ALTER TABLE "team_roles" DROP CONSTRAINT "FK_team_roles_team_id"`);
        await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "FK_teams_tenant_id"`);
        await queryRunner.query(`DROP TABLE "team_members"`);
        await queryRunner.query(`DROP TABLE "team_roles"`);
        await queryRunner.query(`DROP TABLE "teams"`);
    }
}