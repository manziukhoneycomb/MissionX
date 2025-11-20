import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamsTables1745000000000 implements MigrationInterface {
    name = 'CreateTeamsTables1745000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "teams" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "name" character varying(255) NOT NULL, 
                "description" text, 
                "is_active" boolean NOT NULL DEFAULT true, 
                "tenant_id" uuid NOT NULL, 
                "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "team_members" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "team_id" uuid NOT NULL, 
                "user_id" uuid NOT NULL, 
                "is_active" boolean NOT NULL DEFAULT true, 
                "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_7e5523774a38b08a6236d322404" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "team_member_roles" (
                "team_member_id" uuid NOT NULL, 
                "role_id" uuid NOT NULL, 
                CONSTRAINT "PK_team_member_roles" PRIMARY KEY ("team_member_id", "role_id")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_team_member_roles_team_member_id" ON "team_member_roles" ("team_member_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_team_member_roles_role_id" ON "team_member_roles" ("role_id")
        `);

        await queryRunner.query(`
            ALTER TABLE "teams" 
            ADD CONSTRAINT "FK_teams_tenant_id" 
            FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "team_members" 
            ADD CONSTRAINT "FK_team_members_team_id" 
            FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "team_members" 
            ADD CONSTRAINT "FK_team_members_user_id" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "team_member_roles" 
            ADD CONSTRAINT "FK_team_member_roles_team_member_id" 
            FOREIGN KEY ("team_member_id") REFERENCES "team_members"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "team_member_roles" 
            ADD CONSTRAINT "FK_team_member_roles_role_id" 
            FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_team_members_team_user" ON "team_members" ("team_id", "user_id")
        `);

        await queryRunner.query(`
            INSERT INTO "roles" ("name") VALUES 
            ('Team Owner'),
            ('Team Admin'),
            ('Team Member')
            ON CONFLICT ("name") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_team_members_team_user"`);

        await queryRunner.query(
            `ALTER TABLE "team_member_roles" DROP CONSTRAINT "FK_team_member_roles_role_id"`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_member_roles" DROP CONSTRAINT "FK_team_member_roles_team_member_id"`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_members" DROP CONSTRAINT "FK_team_members_user_id"`,
        );
        await queryRunner.query(
            `ALTER TABLE "team_members" DROP CONSTRAINT "FK_team_members_team_id"`,
        );
        await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "FK_teams_tenant_id"`);

        await queryRunner.query(`DROP INDEX "IDX_team_member_roles_role_id"`);
        await queryRunner.query(`DROP INDEX "IDX_team_member_roles_team_member_id"`);

        await queryRunner.query(`DROP TABLE "team_member_roles"`);
        await queryRunner.query(`DROP TABLE "team_members"`);
        await queryRunner.query(`DROP TABLE "teams"`);

        await queryRunner.query(`
            DELETE FROM "roles" WHERE "name" IN ('Team Owner', 'Team Admin', 'Team Member')
        `);
    }
}
