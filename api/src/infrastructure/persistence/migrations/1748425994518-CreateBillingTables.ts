import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBillingTables1748425994518 implements MigrationInterface {
    name = 'CreateBillingTables1748425994518';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create subscriptions table
        const subscriptionsTableExists = await queryRunner.hasTable('subscriptions');
        if (!subscriptionsTableExists) {
            // Create subscription status enum
            await queryRunner.query(
                `CREATE TYPE "public"."subscriptions_status_enum" AS ENUM('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'paused', 'trialing', 'unpaid')`,
            );

            // Create billing interval enum
            await queryRunner.query(
                `CREATE TYPE "public"."subscriptions_billing_interval_enum" AS ENUM('monthly', 'yearly')`,
            );

            await queryRunner.query(
                `CREATE TABLE "subscriptions" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "stripe_subscription_id" character varying(255) NOT NULL,
                    "tenant_id" uuid NOT NULL,
                    "status" "public"."subscriptions_status_enum" NOT NULL DEFAULT 'incomplete',
                    "plan_name" character varying(100) NOT NULL,
                    "plan_id" character varying(255) NOT NULL,
                    "amount" decimal(10,2) NOT NULL,
                    "currency" character varying(3) NOT NULL DEFAULT 'USD',
                    "billing_interval" "public"."subscriptions_billing_interval_enum" NOT NULL,
                    "current_period_start" TIMESTAMP NOT NULL,
                    "current_period_end" TIMESTAMP NOT NULL,
                    "cancel_at_period_end" boolean NOT NULL DEFAULT false,
                    "canceled_at" TIMESTAMP,
                    "trial_start" TIMESTAMP,
                    "trial_end" TIMESTAMP,
                    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "UQ_subscriptions_stripe_subscription_id" UNIQUE ("stripe_subscription_id"),
                    CONSTRAINT "PK_subscriptions" PRIMARY KEY ("id")
                )`,
            );

            await queryRunner.query(
                `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_subscriptions_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
            );

            // Add check constraints for subscriptions
            await queryRunner.query(
                `ALTER TABLE "subscriptions" ADD CONSTRAINT "CHK_subscriptions_amount_positive" CHECK ("amount" > 0)`,
            );
            
            await queryRunner.query(
                `ALTER TABLE "subscriptions" ADD CONSTRAINT "CHK_subscriptions_period_valid" CHECK ("current_period_end" > "current_period_start")`,
            );
        }

        // Create payment_methods table
        const paymentMethodsTableExists = await queryRunner.hasTable('payment_methods');
        if (!paymentMethodsTableExists) {
            // Create payment method type enum
            await queryRunner.query(
                `CREATE TYPE "public"."payment_methods_type_enum" AS ENUM('card', 'bank_account', 'paypal')`,
            );

            await queryRunner.query(
                `CREATE TABLE "payment_methods" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "stripe_payment_method_id" character varying(255) NOT NULL,
                    "tenant_id" uuid NOT NULL,
                    "subscription_id" uuid,
                    "type" "public"."payment_methods_type_enum" NOT NULL DEFAULT 'card',
                    "card_brand" character varying(50),
                    "card_last_four" character varying(4),
                    "card_exp_month" integer,
                    "card_exp_year" integer,
                    "billing_name" character varying(255),
                    "billing_email" character varying(255),
                    "billing_address_line1" character varying(255),
                    "billing_address_line2" character varying(255),
                    "billing_city" character varying(100),
                    "billing_state" character varying(100),
                    "billing_postal_code" character varying(20),
                    "billing_country" character varying(2),
                    "is_default" boolean NOT NULL DEFAULT false,
                    "is_active" boolean NOT NULL DEFAULT true,
                    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "UQ_payment_methods_stripe_payment_method_id" UNIQUE ("stripe_payment_method_id"),
                    CONSTRAINT "PK_payment_methods" PRIMARY KEY ("id")
                )`,
            );

            await queryRunner.query(
                `ALTER TABLE "payment_methods" ADD CONSTRAINT "FK_payment_methods_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
            );
            
            await queryRunner.query(
                `ALTER TABLE "payment_methods" ADD CONSTRAINT "FK_payment_methods_subscription_id" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
            );

            // Add check constraints for payment methods
            await queryRunner.query(
                `ALTER TABLE "payment_methods" ADD CONSTRAINT "CHK_payment_methods_card_exp_month" CHECK ("card_exp_month" IS NULL OR ("card_exp_month" >= 1 AND "card_exp_month" <= 12))`,
            );
            
            await queryRunner.query(
                `ALTER TABLE "payment_methods" ADD CONSTRAINT "CHK_payment_methods_card_exp_year" CHECK ("card_exp_year" IS NULL OR "card_exp_year" >= EXTRACT(YEAR FROM CURRENT_DATE))`,
            );
            
            await queryRunner.query(
                `ALTER TABLE "payment_methods" ADD CONSTRAINT "CHK_payment_methods_card_last_four_length" CHECK ("card_last_four" IS NULL OR length("card_last_four") = 4)`,
            );
        }

        // Create billing_events table
        const billingEventsTableExists = await queryRunner.hasTable('billing_events');
        if (!billingEventsTableExists) {
            // Create billing event category enum
            await queryRunner.query(
                `CREATE TYPE "public"."billing_events_event_category_enum" AS ENUM('invoice_payment_succeeded', 'invoice_payment_failed', 'customer_subscription_created', 'customer_subscription_updated', 'customer_subscription_deleted', 'payment_method_attached', 'payment_method_detached', 'setup_intent_succeeded', 'setup_intent_canceled')`,
            );

            // Create processing status enum
            await queryRunner.query(
                `CREATE TYPE "public"."billing_events_processing_status_enum" AS ENUM('pending', 'processed', 'failed')`,
            );

            await queryRunner.query(
                `CREATE TABLE "billing_events" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "stripe_event_id" character varying(255) NOT NULL,
                    "tenant_id" uuid NOT NULL,
                    "subscription_id" uuid,
                    "event_type" character varying(100) NOT NULL,
                    "event_category" "public"."billing_events_event_category_enum" NOT NULL,
                    "amount" decimal(10,2),
                    "currency" character varying(3),
                    "invoice_id" character varying(255),
                    "payment_intent_id" character varying(255),
                    "description" text,
                    "metadata" jsonb,
                    "processing_status" "public"."billing_events_processing_status_enum" NOT NULL DEFAULT 'pending',
                    "processed_at" TIMESTAMP,
                    "error_message" text,
                    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "UQ_billing_events_stripe_event_id" UNIQUE ("stripe_event_id"),
                    CONSTRAINT "PK_billing_events" PRIMARY KEY ("id")
                )`,
            );

            await queryRunner.query(
                `ALTER TABLE "billing_events" ADD CONSTRAINT "FK_billing_events_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
            );
            
            await queryRunner.query(
                `ALTER TABLE "billing_events" ADD CONSTRAINT "FK_billing_events_subscription_id" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
            );

            // Add check constraint for amount
            await queryRunner.query(
                `ALTER TABLE "billing_events" ADD CONSTRAINT "CHK_billing_events_amount_non_negative" CHECK ("amount" IS NULL OR "amount" >= 0)`,
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop billing_events table
        const billingEventsTableExists = await queryRunner.hasTable('billing_events');
        if (billingEventsTableExists) {
            await queryRunner.query(
                `ALTER TABLE "billing_events" DROP CONSTRAINT IF EXISTS "FK_billing_events_subscription_id"`,
            );
            await queryRunner.query(
                `ALTER TABLE "billing_events" DROP CONSTRAINT IF EXISTS "FK_billing_events_tenant_id"`,
            );
            await queryRunner.query(
                `ALTER TABLE "billing_events" DROP CONSTRAINT IF EXISTS "CHK_billing_events_amount_non_negative"`,
            );
            await queryRunner.query(`DROP TABLE "billing_events"`);
            await queryRunner.query(`DROP TYPE IF EXISTS "public"."billing_events_processing_status_enum"`);
            await queryRunner.query(`DROP TYPE IF EXISTS "public"."billing_events_event_category_enum"`);
        }

        // Drop payment_methods table
        const paymentMethodsTableExists = await queryRunner.hasTable('payment_methods');
        if (paymentMethodsTableExists) {
            await queryRunner.query(
                `ALTER TABLE "payment_methods" DROP CONSTRAINT IF EXISTS "FK_payment_methods_subscription_id"`,
            );
            await queryRunner.query(
                `ALTER TABLE "payment_methods" DROP CONSTRAINT IF EXISTS "FK_payment_methods_tenant_id"`,
            );
            await queryRunner.query(
                `ALTER TABLE "payment_methods" DROP CONSTRAINT IF EXISTS "CHK_payment_methods_card_last_four_length"`,
            );
            await queryRunner.query(
                `ALTER TABLE "payment_methods" DROP CONSTRAINT IF EXISTS "CHK_payment_methods_card_exp_year"`,
            );
            await queryRunner.query(
                `ALTER TABLE "payment_methods" DROP CONSTRAINT IF EXISTS "CHK_payment_methods_card_exp_month"`,
            );
            await queryRunner.query(`DROP TABLE "payment_methods"`);
            await queryRunner.query(`DROP TYPE IF EXISTS "public"."payment_methods_type_enum"`);
        }

        // Drop subscriptions table
        const subscriptionsTableExists = await queryRunner.hasTable('subscriptions');
        if (subscriptionsTableExists) {
            await queryRunner.query(
                `ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "FK_subscriptions_tenant_id"`,
            );
            await queryRunner.query(
                `ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "CHK_subscriptions_period_valid"`,
            );
            await queryRunner.query(
                `ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "CHK_subscriptions_amount_positive"`,
            );
            await queryRunner.query(`DROP TABLE "subscriptions"`);
            await queryRunner.query(`DROP TYPE IF EXISTS "public"."subscriptions_billing_interval_enum"`);
            await queryRunner.query(`DROP TYPE IF EXISTS "public"."subscriptions_status_enum"`);
        }
    }
}