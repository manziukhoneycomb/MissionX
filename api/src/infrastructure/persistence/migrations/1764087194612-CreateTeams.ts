import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeams1764087194612 implements MigrationInterface {
    name = 'CreateTeams1764087194612';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "teams" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "description" text,
                "tenant_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_teams" PRIMARY KEY ("id")
            )`,
        );

        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "team_members" (
                "team_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                CONSTRAINT "PK_team_members" PRIMARY KEY ("team_id", "user_id")
            )`,
        );

        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_teams_tenant_id" ON "teams" ("tenant_id")`,
        );

        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_team_members_team_id" ON "team_members" ("team_id")`,
        );

        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_team_members_user_id" ON "team_members" ("user_id")`,
        );

        await queryRunner.query(
            `DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints
                    WHERE constraint_name = 'FK_teams_tenant_id'
                    AND table_name = 'teams'
                ) THEN
                    ALTER TABLE "teams"
                    ADD CONSTRAINT "FK_teams_tenant_id"
                    FOREIGN KEY ("tenant_id")
                    REFERENCES "tenants"("id")
                    ON DELETE CASCADE
                    ON UPDATE NO ACTION;
                END IF;
            END $$;`,
        );

        await queryRunner.query(
            `DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints
                    WHERE constraint_name = 'FK_team_members_team_id'
                    AND table_name = 'team_members'
                ) THEN
                    ALTER TABLE "team_members"
                    ADD CONSTRAINT "FK_team_members_team_id"
                    FOREIGN KEY ("team_id")
                    REFERENCES "teams"("id")
                    ON DELETE CASCADE
                    ON UPDATE CASCADE;
                END IF;
            END $$;`,
        );

        await queryRunner.query(
            `DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints
                    WHERE constraint_name = 'FK_team_members_user_id'
                    AND table_name = 'team_members'
                ) THEN
                    ALTER TABLE "team_members"
                    ADD CONSTRAINT "FK_team_members_user_id"
                    FOREIGN KEY ("user_id")
                    REFERENCES "users"("id")
                    ON DELETE CASCADE
                    ON UPDATE CASCADE;
                END IF;
            END $$;`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "team_members" DROP CONSTRAINT IF EXISTS "FK_team_members_user_id"`,
        );

        await queryRunner.query(
            `ALTER TABLE "team_members" DROP CONSTRAINT IF EXISTS "FK_team_members_team_id"`,
        );

        await queryRunner.query(
            `ALTER TABLE "teams" DROP CONSTRAINT IF EXISTS "FK_teams_tenant_id"`,
        );

        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_team_members_user_id"`);

        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_team_members_team_id"`);

        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_teams_tenant_id"`);

        await queryRunner.query(`DROP TABLE IF EXISTS "team_members"`);

        await queryRunner.query(`DROP TABLE IF EXISTS "teams"`);
    }
}
