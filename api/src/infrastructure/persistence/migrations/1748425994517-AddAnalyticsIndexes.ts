import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnalyticsIndexes1748425994517 implements MigrationInterface {
    name = 'AddAnalyticsIndexes1748425994517';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE INDEX "IDX_INVOICES_TENANT_ID" ON "invoices" ("tenantId")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_INVOICES_ISSUE_DATE" ON "invoices" ("issueDate")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_INVOICES_DUE_DATE" ON "invoices" ("dueDate")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_INVOICES_TENANT_ISSUE_DATE" ON "invoices" ("tenantId", "issueDate")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_INVOICES_TENANT_DUE_DATE" ON "invoices" ("tenantId", "dueDate")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_INVOICES_CUSTOMER_NAME" ON "invoices" ("customerName")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_INVOICES_VENDOR_NAME" ON "invoices" ("vendorName")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_INVOICES_TOTAL_AMOUNT" ON "invoices" ("totalAmount")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_INVOICES_TENANT_CUSTOMER" ON "invoices" ("tenantId", "customerName")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_INVOICES_TENANT_VENDOR" ON "invoices" ("tenantId", "vendorName")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_INVOICES_TENANT_VENDOR"`);
        await queryRunner.query(`DROP INDEX "IDX_INVOICES_TENANT_CUSTOMER"`);
        await queryRunner.query(`DROP INDEX "IDX_INVOICES_TOTAL_AMOUNT"`);
        await queryRunner.query(`DROP INDEX "IDX_INVOICES_VENDOR_NAME"`);
        await queryRunner.query(`DROP INDEX "IDX_INVOICES_CUSTOMER_NAME"`);
        await queryRunner.query(`DROP INDEX "IDX_INVOICES_TENANT_DUE_DATE"`);
        await queryRunner.query(`DROP INDEX "IDX_INVOICES_TENANT_ISSUE_DATE"`);
        await queryRunner.query(`DROP INDEX "IDX_INVOICES_DUE_DATE"`);
        await queryRunner.query(`DROP INDEX "IDX_INVOICES_ISSUE_DATE"`);
        await queryRunner.query(`DROP INDEX "IDX_INVOICES_TENANT_ID"`);
    }
}