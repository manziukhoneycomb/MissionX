import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnalyticsIndexes1748426000000 implements MigrationInterface {
    name = 'AddAnalyticsIndexes1748426000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_issue_date" ON "invoices" ("tenantId", "issueDate")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_issue_date" ON "invoices" ("issueDate")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_due_date" ON "invoices" ("dueDate")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_due_date" ON "invoices" ("tenantId", "dueDate")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_customer_name" ON "invoices" ("customerName")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_customer" ON "invoices" ("tenantId", "customerName")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_total_amount" ON "invoices" ("totalAmount")`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_invoices_tenant_total_amount" ON "invoices" ("tenantId", "totalAmount")`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_invoices_tenant_total_amount"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_total_amount"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_tenant_customer"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_customer_name"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_tenant_due_date"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_due_date"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_issue_date"`);
        await queryRunner.query(`DROP INDEX "IDX_invoices_tenant_issue_date"`);
    }
}