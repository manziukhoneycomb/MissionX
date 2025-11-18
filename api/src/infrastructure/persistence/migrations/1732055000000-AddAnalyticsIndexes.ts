import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnalyticsIndexes1732055000000 implements MigrationInterface {
    name = 'AddAnalyticsIndexes1732055000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add indexes for frequently queried fields in analytics queries
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_id" ON "invoices" ("tenantId")`
        );
        
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_issue_date" ON "invoices" ("issueDate")`
        );
        
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_due_date" ON "invoices" ("dueDate")`
        );
        
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_customer_name" ON "invoices" ("customerName")`
        );
        
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_total_amount" ON "invoices" ("totalAmount")`
        );
        
        // Composite indexes for common analytics queries
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_issue_date" ON "invoices" ("tenantId", "issueDate")`
        );
        
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_due_date" ON "invoices" ("tenantId", "dueDate")`
        );
        
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_customer" ON "invoices" ("tenantId", "customerName")`
        );
        
        // Index for date range queries with tenant filtering
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_analytics" ON "invoices" ("tenantId", "issueDate", "totalAmount")`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop all the indexes created above
        await queryRunner.query(`DROP INDEX "IDX_invoices_analytics"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_tenant_customer"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_tenant_due_date"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_tenant_issue_date"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_total_amount"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_customer_name"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_due_date"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_issue_date"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_tenant_id"`);
    }
}