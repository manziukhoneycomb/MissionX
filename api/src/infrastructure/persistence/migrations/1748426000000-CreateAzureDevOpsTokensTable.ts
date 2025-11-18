import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAzureDevOpsTokensTable1748426000000 implements MigrationInterface {
    name = 'CreateAzureDevOpsTokensTable1748426000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "azure_devops_tokens" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "tenant_id" uuid NOT NULL,
                "access_token" text NOT NULL,
                "refresh_token" text NOT NULL,
                "expires_at" timestamp NOT NULL,
                "scope" text NOT NULL,
                "created_at" timestamp NOT NULL DEFAULT now(),
                "updated_at" timestamp NOT NULL DEFAULT now(),
                CONSTRAINT "PK_azure_devops_tokens_id" PRIMARY KEY ("id")
            )`,
        );

        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_azure_devops_tokens_user_id" ON "azure_devops_tokens" ("user_id")`,
        );

        await queryRunner.query(
            `ALTER TABLE "azure_devops_tokens" ADD CONSTRAINT "FK_azure_devops_tokens_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );

        await queryRunner.query(
            `ALTER TABLE "azure_devops_tokens" ADD CONSTRAINT "FK_azure_devops_tokens_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "azure_devops_tokens" DROP CONSTRAINT "FK_azure_devops_tokens_tenant_id"`,
        );

        await queryRunner.query(
            `ALTER TABLE "azure_devops_tokens" DROP CONSTRAINT "FK_azure_devops_tokens_user_id"`,
        );

        await queryRunner.query(
            `DROP INDEX "IDX_azure_devops_tokens_user_id"`,
        );

        await queryRunner.query(`DROP TABLE "azure_devops_tokens"`);
    }
}