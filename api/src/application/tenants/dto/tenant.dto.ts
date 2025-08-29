import { ApiProperty } from '@nestjs/swagger';

export class TenantDto {
    @ApiProperty({
        description: 'Unique identifier of the tenant',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Name of the tenant',
        example: 'Acme Corporation',
    })
    name: string;

    @ApiProperty({
        description:
            'Unique alias used for tenant identification, must be lowercase alphanumeric with hyphens',
        example: 'acme-corp',
    })
    alias: string;
}
