import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnalyticsIndexes1748500000000 implements MigrationInterface {
    name = 'AddAnalyticsIndexes1748500000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Index for filtering by tenant and date range (used in most analytics queries)
        await queryRunner.query(
            `CREATE INDEX "IDX_invoice_tenant_issue_date" ON "invoices" ("tenantId", "issueDate")`
        );

        // Index for filtering by tenant and due date (used for aging analysis)
        await queryRunner.query(
            `CREATE INDEX "IDX_invoice_tenant_due_date" ON "invoices" ("tenantId", "dueDate")`
        );

        // Index for filtering by issue date only (for global analytics)
        await queryRunner.query(
            `CREATE INDEX "IDX_invoice_issue_date" ON "invoices" ("issueDate")`
        );

        // Index for filtering by due date only (for global aging analysis)
        await queryRunner.query(
            `CREATE INDEX "IDX_invoice_due_date" ON "invoices" ("dueDate")`
        );

        // Index for customer analytics queries
        await queryRunner.query(
            `CREATE INDEX "IDX_invoice_customer_name" ON "invoices" ("customerName")`
        );

        // Index for total amount queries (value distribution)
        await queryRunner.query(
            `CREATE INDEX "IDX_invoice_total_amount" ON "invoices" ("totalAmount")`
        );

        // Composite index for tenant-specific customer analytics
        await queryRunner.query(
            `CREATE INDEX "IDX_invoice_tenant_customer" ON "invoices" ("tenantId", "customerName")`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes in reverse order
        await queryRunner.query(`DROP INDEX "IDX_invoice_tenant_customer"`);
        await queryRunner.query(`DROP INDEX "IDX_invoice_total_amount"`);
        await queryRunner.query(`DROP INDEX "IDX_invoice_customer_name"`);
        await queryRunner.query(`DROP INDEX "IDX_invoice_due_date"`);
        await queryRunner.query(`DROP INDEX "IDX_invoice_issue_date"`);
        await queryRunner.query(`DROP INDEX "IDX_invoice_tenant_due_date"`);
        await queryRunner.query(`DROP INDEX "IDX_invoice_tenant_issue_date"`);
    }
}