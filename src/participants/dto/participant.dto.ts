import { PartialType } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';
import { Role } from '../../auth/roles/role.enum';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';

export class CreateParticipantDto {
  @ApiProperty({ example: 'Иван Петров' })
  @IsString()
  @Length(1, 120)
  fullName: string;

  @ApiProperty({ example: 15 })
  @IsInt()
  @IsPositive()
  age: number;

  @ApiProperty({ example: 'ivan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+79990000000' })
  @IsString()
  @Length(1, 20)
  phone: string;

  @ApiPropertyOptional({ example: 'Махачкала' })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  city?: string | null;

  @ApiPropertyOptional({ example: '@ivan' })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  telegram?: string | null;
}

export class UpdateParticipantDto extends PartialType(CreateParticipantDto) {}

export class UpdateParticipantAuthDto extends UpdateParticipantDto {
  @ApiPropertyOptional({ example: '9bba1d70-3d4f-4d0f-a223-4f1a0f8520fd' })
  @IsOptional()
  @IsString()
  @Length(1, 128)
  superTokensUserId?: string | null;

  @ApiPropertyOptional({ enum: Role, example: Role.User })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export class ParticipantResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Иван Петров' })
  fullName: string;

  @ApiProperty({ example: 15 })
  age: number;

  @ApiProperty({ example: 'ivan@example.com' })
  email: string;

  @ApiProperty({ example: '+79990000000' })
  phone: string;

  @ApiPropertyOptional({ example: 'Махачкала' })
  city: string | null;

  @ApiPropertyOptional({ example: '@ivan' })
  telegram: string | null;

  @ApiPropertyOptional({ example: '9bba1d70-3d4f-4d0f-a223-4f1a0f8520fd' })
  superTokensUserId: string | null;

  @ApiProperty({ enum: Role, example: Role.User })
  role: Role;
}

export class ParticipantListResponseDto extends PaginationMetaDto {
  @ApiProperty({ type: ParticipantResponseDto, isArray: true })
  items: ParticipantResponseDto[];
}
