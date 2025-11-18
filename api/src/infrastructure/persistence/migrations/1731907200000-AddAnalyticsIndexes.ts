import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnalyticsIndexes1731907200000 implements MigrationInterface {
    name = 'AddAnalyticsIndexes1731907200000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Indexes for analytics queries on invoices table
        
        // Index for tenant-based queries
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_id" ON "invoices" ("tenantId")`,
        );

        // Index for date-based queries (issue date)
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_issue_date" ON "invoices" ("issueDate")`,
        );

        // Index for due date queries (for overdue analysis)
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_due_date" ON "invoices" ("dueDate")`,
        );

        // Composite index for tenant + date range queries (most common analytics query pattern)
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_issue_date" ON "invoices" ("tenantId", "issueDate")`,
        );

        // Composite index for tenant + due date (for overdue analysis)
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_due_date" ON "invoices" ("tenantId", "dueDate")`,
        );

        // Index for customer name (for customer analytics)
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_customer_name" ON "invoices" ("customerName")`,
        );

        // Index for total amount (for amount-based analytics and sorting)
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_total_amount" ON "invoices" ("totalAmount")`,
        );

        // Composite index for customer analysis
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_customer" ON "invoices" ("tenantId", "customerName", "totalAmount")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes in reverse order
        await queryRunner.query(`DROP INDEX "IDX_invoices_tenant_customer"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_total_amount"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_customer_name"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_tenant_due_date"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_tenant_issue_date"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_due_date"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_issue_date"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_tenant_id"`);
    }
}