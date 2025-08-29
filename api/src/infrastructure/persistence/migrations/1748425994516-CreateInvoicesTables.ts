import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInvoicesTables1748425994516 implements MigrationInterface {
    name = 'CreateInvoicesTables1748425994516';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "invoice_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invoiceId" uuid NOT NULL, "lineNumber" integer NOT NULL, "description" character varying(255) NOT NULL, "quantity" integer NOT NULL, "unitPrice" numeric(12,2) NOT NULL, "amount" numeric(12,2) NOT NULL, CONSTRAINT "PK_53b99f9e0e2945e69de1a12b75a" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "invoices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invoiceNumber" character varying(50) NOT NULL, "issueDate" date NOT NULL, "dueDate" date NOT NULL, "vendorName" character varying(255) NOT NULL, "vendorAddress" text NOT NULL, "vendorPhone" character varying(50) NOT NULL, "vendorEmail" character varying(100) NOT NULL, "customerName" character varying(255) NOT NULL, "customerAddress" text NOT NULL, "customerPhone" character varying(50) NOT NULL, "customerEmail" character varying(100) NOT NULL, "subtotal" numeric(12,2) NOT NULL, "discount" numeric(12,2) NOT NULL, "taxRate" numeric(5,4) NOT NULL, "taxAmount" numeric(12,2) NOT NULL, "totalAmount" numeric(12,2) NOT NULL, "tenantId" uuid NOT NULL, CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "invoice_items" ADD CONSTRAINT "FK_7fb6895fc8fad9f5200e91abb59" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "invoices" ADD CONSTRAINT "FK_89c82485e364081f457b210120d" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "invoices" DROP CONSTRAINT "FK_89c82485e364081f457b210120d"`,
        );
        await queryRunner.query(
            `ALTER TABLE "invoice_items" DROP CONSTRAINT "FK_7fb6895fc8fad9f5200e91abb59"`,
        );
        await queryRunner.query(`DROP TABLE "invoices"`);
        await queryRunner.query(`DROP TABLE "invoice_items"`);
    }
    q;
}
