import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnalyticsIndexes1731783452000 implements MigrationInterface {
    name = 'AddAnalyticsIndexes1731783452000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add indexes for analytics queries optimization
        
        // Index for date range queries (most common in analytics)
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_issue_date" ON "invoices" ("issueDate")`
        );
        
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_due_date" ON "invoices" ("dueDate")`
        );
        
        // Composite index for tenant-based analytics with date filtering
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_issue_date" ON "invoices" ("tenantId", "issueDate")`
        );
        
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_due_date" ON "invoices" ("tenantId", "dueDate")`
        );
        
        // Index for customer analytics
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_customer_name" ON "invoices" ("customerName")`
        );
        
        // Composite index for customer analytics with tenant filtering
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_customer" ON "invoices" ("tenantId", "customerName")`
        );
        
        // Index for total amount aggregations
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_total_amount" ON "invoices" ("totalAmount")`
        );
        
        // Composite index for revenue analytics by tenant and date
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_date_amount" ON "invoices" ("tenantId", "issueDate", "totalAmount")`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes in reverse order
        await queryRunner.query(
            `DROP INDEX "IDX_invoices_tenant_date_amount"`
        );
        
        await queryRunner.query(
            `DROP INDEX "IDX_invoices_total_amount"`
        );
        
        await queryRunner.query(
            `DROP INDEX "IDX_invoices_tenant_customer"`
        );
        
        await queryRunner.query(
            `DROP INDEX "IDX_invoices_customer_name"`
        );
        
        await queryRunner.query(
            `DROP INDEX "IDX_invoices_tenant_due_date"`
        );
        
        await queryRunner.query(
            `DROP INDEX "IDX_invoices_tenant_issue_date"`
        );
        
        await queryRunner.query(
            `DROP INDEX "IDX_invoices_due_date"`
        );
        
        await queryRunner.query(
            `DROP INDEX "IDX_invoices_issue_date"`
        );
    }
}