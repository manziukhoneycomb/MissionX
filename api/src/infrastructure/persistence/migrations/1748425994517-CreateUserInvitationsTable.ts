import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserInvitationsTable1748425994517 implements MigrationInterface {
    name = 'CreateUserInvitationsTable1748425994517';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if table already exists
        const tableExists = await queryRunner.hasTable('user_invitations');
        if (!tableExists) {
            // Create user_invitations status enum
            await queryRunner.query(
                `CREATE TYPE "public"."user_invitations_status_enum" AS ENUM('pending', 'accepted', 'expired', 'revoked')`,
            );

            // Create user_invitations table
            await queryRunner.query(
                `CREATE TABLE "user_invitations" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "email" character varying(255) NOT NULL,
                    "invitation_token" character varying(255) NOT NULL,
                    "status" "public"."user_invitations_status_enum" NOT NULL DEFAULT 'pending',
                    "expires_at" TIMESTAMP NOT NULL,
                    "tenant_id" uuid NOT NULL,
                    "invited_by_user_id" uuid NOT NULL,
                    "accepted_by_user_id" uuid,
                    "accepted_at" TIMESTAMP,
                    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "UQ_user_invitations_invitation_token" UNIQUE ("invitation_token"),
                    CONSTRAINT "PK_user_invitations" PRIMARY KEY ("id")
                )`,
            );

            // Add foreign key constraints
            await queryRunner.query(
                `ALTER TABLE "user_invitations" ADD CONSTRAINT "FK_user_invitations_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
            );
            
            await queryRunner.query(
                `ALTER TABLE "user_invitations" ADD CONSTRAINT "FK_user_invitations_invited_by_user_id" FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
            );
            
            await queryRunner.query(
                `ALTER TABLE "user_invitations" ADD CONSTRAINT "FK_user_invitations_accepted_by_user_id" FOREIGN KEY ("accepted_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
            );

            // Add check constraint for expiry date
            await queryRunner.query(
                `ALTER TABLE "user_invitations" ADD CONSTRAINT "CHK_user_invitations_expires_at_future" CHECK ("expires_at" > "created_at")`,
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if table exists before dropping
        const tableExists = await queryRunner.hasTable('user_invitations');
        if (tableExists) {
            // Drop foreign key constraints
            await queryRunner.query(
                `ALTER TABLE "user_invitations" DROP CONSTRAINT IF EXISTS "FK_user_invitations_accepted_by_user_id"`,
            );
            
            await queryRunner.query(
                `ALTER TABLE "user_invitations" DROP CONSTRAINT IF EXISTS "FK_user_invitations_invited_by_user_id"`,
            );
            
            await queryRunner.query(
                `ALTER TABLE "user_invitations" DROP CONSTRAINT IF EXISTS "FK_user_invitations_tenant_id"`,
            );

            // Drop check constraint
            await queryRunner.query(
                `ALTER TABLE "user_invitations" DROP CONSTRAINT IF EXISTS "CHK_user_invitations_expires_at_future"`,
            );

            // Drop table
            await queryRunner.query(`DROP TABLE "user_invitations"`);
            
            // Drop enum type
            await queryRunner.query(`DROP TYPE IF EXISTS "public"."user_invitations_status_enum"`);
        }
    }
}