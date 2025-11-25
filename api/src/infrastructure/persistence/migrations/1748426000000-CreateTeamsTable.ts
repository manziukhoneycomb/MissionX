import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateTeamsTable1748426000000 implements MigrationInterface {
    name = 'CreateTeamsTable1748426000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const teamsTableExists = await queryRunner.hasTable('teams');
        if (!teamsTableExists) {
            await queryRunner.createTable(
                new Table({
                    name: 'teams',
                    columns: [
                        {
                            name: 'id',
                            type: 'uuid',
                            isPrimary: true,
                            default: 'uuid_generate_v4()',
                        },
                        {
                            name: 'name',
                            type: 'varchar',
                            length: '255',
                            isNullable: false,
                        },
                        {
                            name: 'description',
                            type: 'text',
                            isNullable: true,
                        },
                        {
                            name: 'tenant_id',
                            type: 'uuid',
                            isNullable: false,
                        },
                        {
                            name: 'createdAt',
                            type: 'timestamp',
                            default: 'now()',
                        },
                        {
                            name: 'updatedAt',
                            type: 'timestamp',
                            default: 'now()',
                        },
                    ],
                }),
            );

            await queryRunner.createForeignKey(
                'teams',
                new TableForeignKey({
                    columnNames: ['tenant_id'],
                    referencedTableName: 'tenants',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                }),
            );
        }

        const teamMembersTableExists = await queryRunner.hasTable('team_members');
        if (!teamMembersTableExists) {
            await queryRunner.createTable(
                new Table({
                    name: 'team_members',
                    columns: [
                        {
                            name: 'team_id',
                            type: 'uuid',
                            isPrimary: true,
                        },
                        {
                            name: 'user_id',
                            type: 'uuid',
                            isPrimary: true,
                        },
                    ],
                }),
            );

            await queryRunner.createIndex(
                'team_members',
                new TableIndex({
                    name: 'IDX_TEAM_MEMBERS_TEAM_ID',
                    columnNames: ['team_id'],
                }),
            );

            await queryRunner.createIndex(
                'team_members',
                new TableIndex({
                    name: 'IDX_TEAM_MEMBERS_USER_ID',
                    columnNames: ['user_id'],
                }),
            );

            await queryRunner.createForeignKey(
                'team_members',
                new TableForeignKey({
                    columnNames: ['team_id'],
                    referencedTableName: 'teams',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                }),
            );

            await queryRunner.createForeignKey(
                'team_members',
                new TableForeignKey({
                    columnNames: ['user_id'],
                    referencedTableName: 'users',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                }),
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const teamMembersTableExists = await queryRunner.hasTable('team_members');
        if (teamMembersTableExists) {
            const teamMembersTable = await queryRunner.getTable('team_members');
            if (teamMembersTable) {
                const foreignKeys = teamMembersTable.foreignKeys;
                for (const foreignKey of foreignKeys) {
                    await queryRunner.dropForeignKey('team_members', foreignKey);
                }
            }
            await queryRunner.dropTable('team_members');
        }

        const teamsTableExists = await queryRunner.hasTable('teams');
        if (teamsTableExists) {
            const teamsTable = await queryRunner.getTable('teams');
            if (teamsTable) {
                const foreignKeys = teamsTable.foreignKeys;
                for (const foreignKey of foreignKeys) {
                    await queryRunner.dropForeignKey('teams', foreignKey);
                }
            }
            await queryRunner.dropTable('teams');
        }
    }
}
