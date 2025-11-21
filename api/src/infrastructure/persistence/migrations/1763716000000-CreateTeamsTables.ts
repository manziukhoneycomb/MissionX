import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamsTables1763716000000 implements MigrationInterface {
    name = 'CreateTeamsTables1763716000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "teams" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "name" character varying(255) NOT NULL, 
            "description" character varying(500), 
            "isActive" boolean NOT NULL DEFAULT true, 
            "tenant_id" uuid NOT NULL, 
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_7e5523774bfaaf3f99e9dd63cd2" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(
            `CREATE TYPE "public"."team_roles_name_enum" AS ENUM('Team Owner', 'Team Admin', 'Team Member', 'Team Viewer')`,
        );

        await queryRunner.query(`CREATE TABLE "team_roles" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "name" "public"."team_roles_name_enum" NOT NULL, 
            "description" character varying(500), 
            CONSTRAINT "UQ_d7f3996c5e3566750bce2d5f1d7" UNIQUE ("name"), 
            CONSTRAINT "PK_4d682873a391d93b0e5fe2f082f" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`CREATE TABLE "team_members" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "team_id" uuid NOT NULL, 
            "user_id" uuid NOT NULL, 
            "team_role_id" uuid NOT NULL, 
            "isActive" boolean NOT NULL DEFAULT true, 
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_fdad7503f2b2c82e63c6f1c5c0e" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(
            `ALTER TABLE "teams" ADD CONSTRAINT "FK_teams_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );

        await queryRunner.query(
            `ALTER TABLE "team_members" ADD CONSTRAINT "FK_team_members_team_id" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );

        await queryRunner.query(
            `ALTER TABLE "team_members" ADD CONSTRAINT "FK_team_members_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );

        await queryRunner.query(
            `ALTER TABLE "team_members" ADD CONSTRAINT "FK_team_members_team_role_id" FOREIGN KEY ("team_role_id") REFERENCES "team_roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );

        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_team_member_unique" ON "team_members" ("team_id", "user_id")`,
        );

        await queryRunner.query(`INSERT INTO "team_roles" ("name", "description") VALUES 
            ('Team Owner', 'Full control over team settings and members'),
            ('Team Admin', 'Can manage team members and settings'),
            ('Team Member', 'Standard team member with access to team resources'),
            ('Team Viewer', 'Read-only access to team resources')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_team_member_unique"`);
        await queryRunner.query(
            `ALTER TABLE "team_members" DROP CONSTRAINT "FK_team_members_team_role_id"`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_members" DROP CONSTRAINT "FK_team_members_user_id"`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_members" DROP CONSTRAINT "FK_team_members_team_id"`,
        );
        await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "FK_teams_tenant_id"`);
        await queryRunner.query(`DROP TABLE "team_members"`);
        await queryRunner.query(`DROP TABLE "team_roles"`);
        await queryRunner.query(`DROP TYPE "public"."team_roles_name_enum"`);
        await queryRunner.query(`DROP TABLE "teams"`);
    }
}
