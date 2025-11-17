import { MigrationInterface, QueryRunner } from 'typeorm';

export class AnalyticsIndexes1748485900000 implements MigrationInterface {
    name = 'AnalyticsIndexes1748485900000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_INVOICE_ISSUE_DATE" 
            ON "invoices" ("issueDate");
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_INVOICE_DUE_DATE" 
            ON "invoices" ("dueDate");
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_INVOICE_TENANT_ISSUE_DATE" 
            ON "invoices" ("tenantId", "issueDate");
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_INVOICE_TENANT_DUE_DATE" 
            ON "invoices" ("tenantId", "dueDate");
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_INVOICE_TOTAL_AMOUNT" 
            ON "invoices" ("totalAmount");
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_INVOICE_TENANT_TOTAL_AMOUNT" 
            ON "invoices" ("tenantId", "totalAmount");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_INVOICE_TENANT_TOTAL_AMOUNT"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_INVOICE_TOTAL_AMOUNT"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_INVOICE_TENANT_DUE_DATE"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_INVOICE_TENANT_ISSUE_DATE"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_INVOICE_DUE_DATE"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_INVOICE_ISSUE_DATE"`);
    }
}