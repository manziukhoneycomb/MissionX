import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnalyticsIndexes1748425994517 implements MigrationInterface {
    name = 'AddAnalyticsIndexes1748425994517';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Analytics performance indexes for invoices table
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_issueDate" ON "invoices" ("issueDate")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_dueDate" ON "invoices" ("dueDate")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenantId_issueDate" ON "invoices" ("tenantId", "issueDate")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_customerName" ON "invoices" ("customerName")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_totalAmount" ON "invoices" ("totalAmount")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenantId_dueDate" ON "invoices" ("tenantId", "dueDate")`
        );
        
        // Compound indexes for common analytics queries
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_date_range" ON "invoices" ("tenantId", "issueDate", "totalAmount")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_customer_revenue" ON "invoices" ("customerName", "totalAmount", "issueDate")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_overdue_analysis" ON "invoices" ("dueDate", "totalAmount", "tenantId")`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_invoices_overdue_analysis"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_customer_revenue"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_tenant_date_range"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_tenantId_dueDate"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_totalAmount"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_customerName"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_tenantId_issueDate"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_dueDate"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_issueDate"`);
    }
}