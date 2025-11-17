import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnalyticsIndexes1748500000000 implements MigrationInterface {
    name = 'AddAnalyticsIndexes1748500000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add composite index for tenant-based date range queries
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_invoices_tenant_issue_date" 
            ON "invoices" ("tenantId", "issueDate")
        `);

        // Add index for due date queries (aging analysis)
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_invoices_due_date" 
            ON "invoices" ("dueDate")
        `);

        // Add index for customer analytics
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_invoices_customer_tenant_date" 
            ON "invoices" ("customerName", "tenantId", "issueDate")
        `);

        // Add index for total amount queries
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_invoices_total_amount" 
            ON "invoices" ("totalAmount")
        `);

        // Add composite index for comprehensive analytics queries
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_invoices_analytics_composite" 
            ON "invoices" ("tenantId", "issueDate", "dueDate", "totalAmount")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoices_analytics_composite"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoices_total_amount"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoices_customer_tenant_date"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoices_due_date"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoices_tenant_issue_date"`);
    }
}