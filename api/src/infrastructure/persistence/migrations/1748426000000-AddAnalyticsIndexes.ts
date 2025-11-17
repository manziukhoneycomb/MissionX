import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnalyticsIndexes1748426000000 implements MigrationInterface {
    name = 'AddAnalyticsIndexes1748426000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Index for tenant-based queries (most common filter)
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_id" ON "invoices" ("tenantId")`,
        );

        // Index for date-based queries (analytics by date range)
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_issue_date" ON "invoices" ("issueDate")`,
        );

        // Index for due date queries (overdue analysis)
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_due_date" ON "invoices" ("dueDate")`,
        );

        // Composite index for tenant + date range queries (most common analytics query pattern)
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_issue_date" ON "invoices" ("tenantId", "issueDate")`,
        );

        // Composite index for tenant + due date (aging analysis)
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_due_date" ON "invoices" ("tenantId", "dueDate")`,
        );

        // Index for total amount queries (revenue calculations)
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_total_amount" ON "invoices" ("totalAmount")`,
        );

        // Composite index for efficient revenue trend queries
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_issue_total" ON "invoices" ("tenantId", "issueDate", "totalAmount")`,
        );

        // Index for invoice number uniqueness and lookups
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_invoice_number" ON "invoices" ("invoiceNumber")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_invoices_invoice_number"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_tenant_issue_total"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_total_amount"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_tenant_due_date"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_tenant_issue_date"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_due_date"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_issue_date"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_tenant_id"`);
    }
}