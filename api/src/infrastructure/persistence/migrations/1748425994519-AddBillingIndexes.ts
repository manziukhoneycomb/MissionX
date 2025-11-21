import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBillingIndexes1748425994519 implements MigrationInterface {
    name = 'AddBillingIndexes1748425994519';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // User Invitations Indexes
        const userInvitationsTableExists = await queryRunner.hasTable('user_invitations');
        if (userInvitationsTableExists) {
            // Index for finding invitations by tenant
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_user_invitations_tenant_id" ON "user_invitations" ("tenant_id")`,
            );

            // Index for finding invitations by email
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_user_invitations_email" ON "user_invitations" ("email")`,
            );

            // Index for finding invitations by status
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_user_invitations_status" ON "user_invitations" ("status")`,
            );

            // Index for finding invitations by invited user
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_user_invitations_invited_by_user_id" ON "user_invitations" ("invited_by_user_id")`,
            );

            // Compound index for finding active invitations by tenant
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_user_invitations_tenant_status_expires" ON "user_invitations" ("tenant_id", "status", "expires_at")`,
            );

            // Index for cleanup of expired invitations
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_user_invitations_expires_at" ON "user_invitations" ("expires_at")`,
            );
        }

        // Subscriptions Indexes
        const subscriptionsTableExists = await queryRunner.hasTable('subscriptions');
        if (subscriptionsTableExists) {
            // Index for finding subscription by tenant
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_subscriptions_tenant_id" ON "subscriptions" ("tenant_id")`,
            );

            // Index for finding active subscriptions
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_subscriptions_status" ON "subscriptions" ("status")`,
            );

            // Index for finding subscriptions by current period
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_subscriptions_current_period_end" ON "subscriptions" ("current_period_end")`,
            );

            // Compound index for finding active tenant subscriptions
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_subscriptions_tenant_status" ON "subscriptions" ("tenant_id", "status")`,
            );

            // Index for billing cycle queries
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_subscriptions_billing_interval_status" ON "subscriptions" ("billing_interval", "status")`,
            );

            // Index for trial subscriptions
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_subscriptions_trial_end" ON "subscriptions" ("trial_end") WHERE "trial_end" IS NOT NULL`,
            );
        }

        // Payment Methods Indexes
        const paymentMethodsTableExists = await queryRunner.hasTable('payment_methods');
        if (paymentMethodsTableExists) {
            // Index for finding payment methods by tenant
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_payment_methods_tenant_id" ON "payment_methods" ("tenant_id")`,
            );

            // Index for finding payment methods by subscription
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_payment_methods_subscription_id" ON "payment_methods" ("subscription_id")`,
            );

            // Index for finding active payment methods
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_payment_methods_is_active" ON "payment_methods" ("is_active")`,
            );

            // Index for finding default payment methods
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_payment_methods_is_default" ON "payment_methods" ("is_default") WHERE "is_default" = true`,
            );

            // Compound index for finding active tenant payment methods
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_payment_methods_tenant_active" ON "payment_methods" ("tenant_id", "is_active")`,
            );

            // Index for payment method type queries
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_payment_methods_type" ON "payment_methods" ("type")`,
            );
        }

        // Billing Events Indexes
        const billingEventsTableExists = await queryRunner.hasTable('billing_events');
        if (billingEventsTableExists) {
            // Index for finding events by tenant
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_billing_events_tenant_id" ON "billing_events" ("tenant_id")`,
            );

            // Index for finding events by subscription
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_billing_events_subscription_id" ON "billing_events" ("subscription_id")`,
            );

            // Index for finding events by category
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_billing_events_event_category" ON "billing_events" ("event_category")`,
            );

            // Index for finding events by processing status
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_billing_events_processing_status" ON "billing_events" ("processing_status")`,
            );

            // Index for finding events by created date (for reporting)
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_billing_events_created_at" ON "billing_events" ("created_at")`,
            );

            // Compound index for finding unprocessed events by tenant
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_billing_events_tenant_processing_status" ON "billing_events" ("tenant_id", "processing_status")`,
            );

            // Compound index for webhook processing
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_billing_events_category_status_created" ON "billing_events" ("event_category", "processing_status", "created_at")`,
            );

            // Index for invoice-related events
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_billing_events_invoice_id" ON "billing_events" ("invoice_id") WHERE "invoice_id" IS NOT NULL`,
            );

            // Index for payment intent events
            await queryRunner.query(
                `CREATE INDEX IF NOT EXISTS "IDX_billing_events_payment_intent_id" ON "billing_events" ("payment_intent_id") WHERE "payment_intent_id" IS NOT NULL`,
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop Billing Events Indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_billing_events_payment_intent_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_billing_events_invoice_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_billing_events_category_status_created"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_billing_events_tenant_processing_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_billing_events_created_at"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_billing_events_processing_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_billing_events_event_category"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_billing_events_subscription_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_billing_events_tenant_id"`);

        // Drop Payment Methods Indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payment_methods_type"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payment_methods_tenant_active"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payment_methods_is_default"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payment_methods_is_active"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payment_methods_subscription_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payment_methods_tenant_id"`);

        // Drop Subscriptions Indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_subscriptions_trial_end"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_subscriptions_billing_interval_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_subscriptions_tenant_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_subscriptions_current_period_end"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_subscriptions_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_subscriptions_tenant_id"`);

        // Drop User Invitations Indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_invitations_expires_at"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_invitations_tenant_status_expires"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_invitations_invited_by_user_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_invitations_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_invitations_email"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_invitations_tenant_id"`);
    }
}