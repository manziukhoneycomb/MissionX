import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInvitationsTable1748426894516 implements MigrationInterface {
    name = 'CreateInvitationsTable1748426894516'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."invitations_status_enum" AS ENUM('pending', 'accepted', 'expired')`);
        await queryRunner.query(`CREATE TABLE "invitations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "firstName" character varying(100), "lastName" character varying(100), "status" "public"."invitations_status_enum" NOT NULL DEFAULT 'pending', "invited_by" character varying(255) NOT NULL, "expires_at" TIMESTAMP NOT NULL, "tenant_id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5dec98cfdfd562e4ad3648bbb07" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "invitation_roles" ("invitation_id" uuid NOT NULL, "role_id" uuid NOT NULL, CONSTRAINT "PK_4e8f7f8b41ef7b88f5b4f8a0bbb" PRIMARY KEY ("invitation_id", "role_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4e8f7f8b41ef7b88f5b4f8a0bb" ON "invitation_roles" ("invitation_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_5dec98cfdfd562e4ad3648bbb0" ON "invitation_roles" ("role_id") `);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_4b5fd6c6bb83c1916f6b0b94c3b" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invitation_roles" ADD CONSTRAINT "FK_4e8f7f8b41ef7b88f5b4f8a0bbb" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "invitation_roles" ADD CONSTRAINT "FK_5dec98cfdfd562e4ad3648bbb07" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invitation_roles" DROP CONSTRAINT "FK_5dec98cfdfd562e4ad3648bbb07"`);
        await queryRunner.query(`ALTER TABLE "invitation_roles" DROP CONSTRAINT "FK_4e8f7f8b41ef7b88f5b4f8a0bbb"`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_4b5fd6c6bb83c1916f6b0b94c3b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5dec98cfdfd562e4ad3648bbb0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4e8f7f8b41ef7b88f5b4f8a0bb"`);
        await queryRunner.query(`DROP TABLE "invitation_roles"`);
        await queryRunner.query(`DROP TABLE "invitations"`);
        await queryRunner.query(`DROP TYPE "public"."invitations_status_enum"`);
    }
}