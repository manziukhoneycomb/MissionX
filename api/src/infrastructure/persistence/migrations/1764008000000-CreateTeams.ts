import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateTeams1764008000000 implements MigrationInterface {
    name = 'CreateTeams1764008000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if teams table already exists
        const teamsTableExists = await queryRunner.hasTable('teams');

        if (!teamsTableExists) {
            // Create teams table
            await queryRunner.createTable(
                new Table({
                    name: 'teams',
                    columns: [
                        {
                            name: 'id',
                            type: 'uuid',
                            isPrimary: true,
                            generationStrategy: 'uuid',
                            default: 'uuid_generate_v4()',
                        },
                        {
                            name: 'name',
                            type: 'varchar',
                            length: '255',
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
                            default: 'CURRENT_TIMESTAMP',
                        },
                        {
                            name: 'updatedAt',
                            type: 'timestamp',
                            default: 'CURRENT_TIMESTAMP',
                            onUpdate: 'CURRENT_TIMESTAMP',
                        },
                    ],
                }),
                true,
            );

            // Add foreign key for tenant
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

        // Check if team_users table already exists
        const teamUsersTableExists = await queryRunner.hasTable('team_users');

        if (!teamUsersTableExists) {
            // Create team_users junction table
            await queryRunner.createTable(
                new Table({
                    name: 'team_users',
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
                true,
            );

            // Add foreign keys for team_users
            await queryRunner.createForeignKey(
                'team_users',
                new TableForeignKey({
                    columnNames: ['team_id'],
                    referencedTableName: 'teams',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                }),
            );

            await queryRunner.createForeignKey(
                'team_users',
                new TableForeignKey({
                    columnNames: ['user_id'],
                    referencedTableName: 'users',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                }),
            );

            // Add indexes for team_users
            await queryRunner.createIndex(
                'team_users',
                new TableIndex({
                    name: 'IDX_team_users_team_id',
                    columnNames: ['team_id'],
                }),
            );

            await queryRunner.createIndex(
                'team_users',
                new TableIndex({
                    name: 'IDX_team_users_user_id',
                    columnNames: ['user_id'],
                }),
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check and drop team_users table first
        const teamUsersTableExists = await queryRunner.hasTable('team_users');
        if (teamUsersTableExists) {
            // Drop indexes
            const teamUsersIndexes = await queryRunner.getTable('team_users');
            if (teamUsersIndexes) {
                const userIdIndex = teamUsersIndexes.indices.find(
                    (idx) => idx.name === 'IDX_team_users_user_id',
                );
                const teamIdIndex = teamUsersIndexes.indices.find(
                    (idx) => idx.name === 'IDX_team_users_team_id',
                );

                if (userIdIndex) {
                    await queryRunner.dropIndex('team_users', 'IDX_team_users_user_id');
                }
                if (teamIdIndex) {
                    await queryRunner.dropIndex('team_users', 'IDX_team_users_team_id');
                }
            }

            // Drop team_users table (this will also drop the foreign keys)
            await queryRunner.dropTable('team_users');
        }

        // Check and drop teams table
        const teamsTableExists = await queryRunner.hasTable('teams');
        if (teamsTableExists) {
            await queryRunner.dropTable('teams');
        }
    }
}
