import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBillingTables1763683984339 implements MigrationInterface {
    name = 'CreateBillingTables1763683984339'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_invitations_status_enum" AS ENUM('pending', 'accepted', 'expired', 'revoked')`);
        await queryRunner.query(`CREATE TABLE "user_invitations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "firstName" character varying(100), "lastName" character varying(100), "invitation_token" character varying(255) NOT NULL, "status" "public"."user_invitations_status_enum" NOT NULL DEFAULT 'pending', "expires_at" TIMESTAMP NOT NULL, "tenant_id" uuid NOT NULL, "invited_by_user_id" uuid NOT NULL, "accepted_by_user_id" uuid, "accepted_at" TIMESTAMP, "message" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_299e6a82a403100f02d8b813bcb" UNIQUE ("invitation_token"), CONSTRAINT "PK_c8005acb91c3ce9a7ae581eca8f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."payment_methods_type_enum" AS ENUM('card', 'bank_account', 'paypal')`);
        await queryRunner.query(`CREATE TABLE "payment_methods" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "stripe_payment_method_id" character varying(255) NOT NULL, "tenant_id" uuid NOT NULL, "subscription_id" uuid, "type" "public"."payment_methods_type_enum" NOT NULL DEFAULT 'card', "card_brand" character varying(50), "card_last_four" character varying(4), "card_exp_month" integer, "card_exp_year" integer, "billing_name" character varying(255), "billing_email" character varying(255), "billing_address_line1" character varying(255), "billing_address_line2" character varying(255), "billing_city" character varying(100), "billing_state" character varying(100), "billing_postal_code" character varying(20), "billing_country" character varying(2), "is_default" boolean NOT NULL DEFAULT false, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1f03501f788e64bf699d206fa51" UNIQUE ("stripe_payment_method_id"), CONSTRAINT "PK_34f9b8c6dfb4ac3559f7e2820d1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."billing_events_eventcategory_enum" AS ENUM('invoice_payment_succeeded', 'invoice_payment_failed', 'customer_subscription_created', 'customer_subscription_updated', 'customer_subscription_deleted', 'payment_method_attached', 'payment_method_detached', 'setup_intent_succeeded', 'setup_intent_canceled')`);
        await queryRunner.query(`CREATE TYPE "public"."billing_events_processingstatus_enum" AS ENUM('pending', 'processed', 'failed')`);
        await queryRunner.query(`CREATE TABLE "billing_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "stripe_event_id" character varying(255) NOT NULL, "tenant_id" uuid NOT NULL, "subscription_id" uuid, "event_type" character varying(100) NOT NULL, "eventCategory" "public"."billing_events_eventcategory_enum" NOT NULL, "amount" numeric(10,2), "currency" character varying(3), "invoice_id" character varying(255), "payment_intent_id" character varying(255), "description" text, "metadata" jsonb, "processingStatus" "public"."billing_events_processingstatus_enum" NOT NULL DEFAULT 'pending', "processed_at" TIMESTAMP, "error_message" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_387db6c4b64daf7f38a0c02eb0f" UNIQUE ("stripe_event_id"), CONSTRAINT "PK_9a4a4a1b1f55bbc868f6a76a597" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."subscriptions_status_enum" AS ENUM('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'paused', 'trialing', 'unpaid')`);
        await queryRunner.query(`CREATE TYPE "public"."subscriptions_billing_interval_enum" AS ENUM('monthly', 'yearly')`);
        await queryRunner.query(`CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "stripe_subscription_id" character varying(255) NOT NULL, "tenant_id" uuid NOT NULL, "status" "public"."subscriptions_status_enum" NOT NULL DEFAULT 'incomplete', "plan_name" character varying(100) NOT NULL, "plan_id" character varying(255) NOT NULL, "amount" numeric(10,2) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT 'USD', "billing_interval" "public"."subscriptions_billing_interval_enum" NOT NULL, "current_period_start" TIMESTAMP NOT NULL, "current_period_end" TIMESTAMP NOT NULL, "cancel_at_period_end" boolean NOT NULL DEFAULT false, "canceled_at" TIMESTAMP, "trial_start" TIMESTAMP, "trial_end" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3a2d09d943f39912a01831a9272" UNIQUE ("stripe_subscription_id"), CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."roles_name_enum" RENAME TO "roles_name_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."roles_name_enum" AS ENUM('Super Admin', 'Admin', 'User')`);
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "name" TYPE "public"."roles_name_enum" USING "name"::"text"::"public"."roles_name_enum"`);
        await queryRunner.query(`DROP TYPE "public"."roles_name_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user_invitations" ADD CONSTRAINT "FK_83931d256c5459914516265ab28" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_invitations" ADD CONSTRAINT "FK_a8b96bc9423ba7ea8980f80db12" FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_invitations" ADD CONSTRAINT "FK_be9c7843b9891d8a94e2ec7b9ee" FOREIGN KEY ("accepted_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_methods" ADD CONSTRAINT "FK_e65eddc13f0cb1694ce740dc6b7" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_methods" ADD CONSTRAINT "FK_7af845a1aa972a878c9dc5879f9" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "billing_events" ADD CONSTRAINT "FK_3bcd9a95fb107010efc3a1340ea" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "billing_events" ADD CONSTRAINT "FK_fcdec7fcf93efbdc7adec97eb79" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_f6ac03431c311ccb8bbd7d3af18" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_f6ac03431c311ccb8bbd7d3af18"`);
        await queryRunner.query(`ALTER TABLE "billing_events" DROP CONSTRAINT "FK_fcdec7fcf93efbdc7adec97eb79"`);
        await queryRunner.query(`ALTER TABLE "billing_events" DROP CONSTRAINT "FK_3bcd9a95fb107010efc3a1340ea"`);
        await queryRunner.query(`ALTER TABLE "payment_methods" DROP CONSTRAINT "FK_7af845a1aa972a878c9dc5879f9"`);
        await queryRunner.query(`ALTER TABLE "payment_methods" DROP CONSTRAINT "FK_e65eddc13f0cb1694ce740dc6b7"`);
        await queryRunner.query(`ALTER TABLE "user_invitations" DROP CONSTRAINT "FK_be9c7843b9891d8a94e2ec7b9ee"`);
        await queryRunner.query(`ALTER TABLE "user_invitations" DROP CONSTRAINT "FK_a8b96bc9423ba7ea8980f80db12"`);
        await queryRunner.query(`ALTER TABLE "user_invitations" DROP CONSTRAINT "FK_83931d256c5459914516265ab28"`);
        await queryRunner.query(`CREATE TYPE "public"."roles_name_enum_old" AS ENUM('Super Admin', 'Admin', 'User', 'Team Owner', 'Team Admin', 'Team Member')`);
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "name" TYPE "public"."roles_name_enum_old" USING "name"::"text"::"public"."roles_name_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."roles_name_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."roles_name_enum_old" RENAME TO "roles_name_enum"`);
        await queryRunner.query(`DROP TABLE "subscriptions"`);
        await queryRunner.query(`DROP TYPE "public"."subscriptions_billing_interval_enum"`);
        await queryRunner.query(`DROP TYPE "public"."subscriptions_status_enum"`);
        await queryRunner.query(`DROP TABLE "billing_events"`);
        await queryRunner.query(`DROP TYPE "public"."billing_events_processingstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."billing_events_eventcategory_enum"`);
        await queryRunner.query(`DROP TABLE "payment_methods"`);
        await queryRunner.query(`DROP TYPE "public"."payment_methods_type_enum"`);
        await queryRunner.query(`DROP TABLE "user_invitations"`);
        await queryRunner.query(`DROP TYPE "public"."user_invitations_status_enum"`);
    }

}
