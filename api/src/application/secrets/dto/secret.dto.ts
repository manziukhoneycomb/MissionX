import { IsEnum, IsString } from 'class-validator';
import { SecretKey } from '../../../domain/enums/secret-key.enum';
import { ApiProperty } from '@nestjs/swagger';

export class SecretDto {
    @ApiProperty({
        description: 'Key identifier for the secret',
        enum: SecretKey,
        example: SecretKey.STRIPE,
    })
    @IsEnum(SecretKey)
    readonly key: SecretKey;

    @ApiProperty({
        description: 'Value of the secret',
        example: 'sk_test_123456789',
        nullable: true,
    })
    @IsString()
    readonly value: string | null;
}
