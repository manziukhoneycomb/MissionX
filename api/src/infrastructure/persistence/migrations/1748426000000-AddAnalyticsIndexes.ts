import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnalyticsIndexes1748426000000 implements MigrationInterface {
    name = 'AddAnalyticsIndexes1748426000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add indexes for optimized analytics queries
        
        // Index for date-based queries (most common filter)
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_issue_date" ON "invoices" ("issueDate")`
        );
        
        // Index for due date queries (aging analysis)
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_due_date" ON "invoices" ("dueDate")`
        );
        
        // Composite index for tenant + date filtering
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_issue_date" ON "invoices" ("tenantId", "issueDate")`
        );
        
        // Composite index for tenant + due date filtering
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_due_date" ON "invoices" ("tenantId", "dueDate")`
        );
        
        // Index for total amount aggregations
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_total_amount" ON "invoices" ("totalAmount")`
        );
        
        // Composite index for tenant + total amount (revenue calculations)
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_total_amount" ON "invoices" ("tenantId", "totalAmount")`
        );
        
        // Index for customer name (top customers analysis)
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_customer_name" ON "invoices" ("customerName")`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes in reverse order
        await queryRunner.query(`DROP INDEX "IDX_invoices_customer_name"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_tenant_total_amount"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_total_amount"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_tenant_due_date"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_tenant_issue_date"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_due_date"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_issue_date"`);
    }
}