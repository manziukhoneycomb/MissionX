import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamsAndTeamMembers1763654857413 implements MigrationInterface {
    name = 'CreateTeamsAndTeamMembers1763654857413';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "team_members" DROP CONSTRAINT "FK_team_members_team"`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_members" DROP CONSTRAINT "FK_team_members_user"`,
        );
        await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "FK_teams_tenant"`);
        await queryRunner.query(`ALTER TABLE "teams" DROP COLUMN "isActive"`);
        await queryRunner.query(
            `ALTER TABLE "team_members" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
        );
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "PK_team_members"`);
        await queryRunner.query(
            `ALTER TABLE "team_members" ADD CONSTRAINT "PK_team_members" PRIMARY KEY ("team_id", "user_id", "id")`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."team_members_role_enum" AS ENUM('Super Admin', 'Admin', 'User', 'Team Owner', 'Team Admin', 'Team Member')`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_members" ADD "role" "public"."team_members_role_enum" NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_members" ADD "joined_at" TIMESTAMP NOT NULL DEFAULT now()`,
        );
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "PK_team_members"`);
        await queryRunner.query(
            `ALTER TABLE "team_members" ADD CONSTRAINT "PK_team_members" PRIMARY KEY ("user_id", "id")`,
        );
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "PK_team_members"`);
        await queryRunner.query(
            `ALTER TABLE "team_members" ADD CONSTRAINT "PK_ca3eae89dcf20c9fd95bf7460aa" PRIMARY KEY ("id")`,
        );
        await queryRunner.query(`ALTER TABLE "teams" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "teams" ADD "description" text`);
        await queryRunner.query(
            `ALTER TYPE "public"."roles_name_enum" RENAME TO "roles_name_enum_old"`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."roles_name_enum" AS ENUM('Super Admin', 'Admin', 'User', 'Team Owner', 'Team Admin', 'Team Member')`,
        );
        await queryRunner.query(
            `ALTER TABLE "roles" ALTER COLUMN "name" TYPE "public"."roles_name_enum" USING "name"::"text"::"public"."roles_name_enum"`,
        );
        await queryRunner.query(`DROP TYPE "public"."roles_name_enum_old"`);
        await queryRunner.query(
            `ALTER TABLE "team_members" ADD CONSTRAINT "UQ_1d3c06a8217a8785e2af0ec4ab8" UNIQUE ("team_id", "user_id")`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_members" ADD CONSTRAINT "FK_fdad7d5768277e60c40e01cdcea" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_members" ADD CONSTRAINT "FK_c2bf4967c8c2a6b845dadfbf3d4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "teams" ADD CONSTRAINT "FK_11c78d7c145fb2c24ae04b17c0c" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "teams" DROP CONSTRAINT "FK_11c78d7c145fb2c24ae04b17c0c"`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_members" DROP CONSTRAINT "FK_c2bf4967c8c2a6b845dadfbf3d4"`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_members" DROP CONSTRAINT "FK_fdad7d5768277e60c40e01cdcea"`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_members" DROP CONSTRAINT "UQ_1d3c06a8217a8785e2af0ec4ab8"`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."roles_name_enum_old" AS ENUM('Super Admin', 'Admin', 'User')`,
        );
        await queryRunner.query(
            `ALTER TABLE "roles" ALTER COLUMN "name" TYPE "public"."roles_name_enum_old" USING "name"::"text"::"public"."roles_name_enum_old"`,
        );
        await queryRunner.query(`DROP TYPE "public"."roles_name_enum"`);
        await queryRunner.query(
            `ALTER TYPE "public"."roles_name_enum_old" RENAME TO "roles_name_enum"`,
        );
        await queryRunner.query(`ALTER TABLE "teams" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "teams" ADD "description" character varying(500)`);
        await queryRunner.query(
            `ALTER TABLE "team_members" DROP CONSTRAINT "PK_ca3eae89dcf20c9fd95bf7460aa"`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_members" ADD CONSTRAINT "PK_team_members" PRIMARY KEY ("user_id", "id")`,
        );
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "PK_team_members"`);
        await queryRunner.query(
            `ALTER TABLE "team_members" ADD CONSTRAINT "PK_team_members" PRIMARY KEY ("team_id", "user_id", "id")`,
        );
        await queryRunner.query(`ALTER TABLE "team_members" DROP COLUMN "joined_at"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."team_members_role_enum"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "PK_team_members"`);
        await queryRunner.query(
            `ALTER TABLE "team_members" ADD CONSTRAINT "PK_team_members" PRIMARY KEY ("team_id", "user_id")`,
        );
        await queryRunner.query(`ALTER TABLE "team_members" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "teams" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(
            `ALTER TABLE "teams" ADD CONSTRAINT "FK_teams_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_members" ADD CONSTRAINT "FK_team_members_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_members" ADD CONSTRAINT "FK_team_members_team" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }
}
