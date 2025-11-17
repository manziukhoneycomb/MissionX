import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnalyticsIndexes1748428000000 implements MigrationInterface {
    name = 'AddAnalyticsIndexes1748428000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add indexes for analytics queries performance optimization
        
        // Index for date-based filtering (most common in analytics)
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_issue_date" ON "invoices" ("issueDate")`
        );
        
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_due_date" ON "invoices" ("dueDate")`
        );
        
        // Index for tenant-based filtering
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_id" ON "invoices" ("tenantId")`
        );
        
        // Composite index for tenant + date range queries (most efficient for analytics)
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_issue_date" ON "invoices" ("tenantId", "issueDate")`
        );
        
        // Index for amount-based analytics queries
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_total_amount" ON "invoices" ("totalAmount")`
        );
        
        // Composite index for status-based analytics (tenant + due date for overdue calculations)
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_due_date" ON "invoices" ("tenantId", "dueDate")`
        );
        
        // Index for invoice number lookups (secondary optimization)
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_invoice_number" ON "invoices" ("invoiceNumber")`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes in reverse order
        await queryRunner.query(`DROP INDEX "IDX_invoices_invoice_number"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_tenant_due_date"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_total_amount"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_tenant_issue_date"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_tenant_id"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_due_date"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_issue_date"`);
    }
}