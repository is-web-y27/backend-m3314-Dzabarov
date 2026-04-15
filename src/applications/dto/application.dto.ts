import { PartialType } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';
import { ApplicationStatus } from '../entities/application.entity';

export class CreateApplicationDto {
  @ApiPropertyOptional({
    enum: ApplicationStatus,
    example: ApplicationStatus.NEW,
    default: ApplicationStatus.NEW,
  })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiProperty({ example: true })
  @IsBoolean()
  medicalApproved: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  parentConsent: boolean;

  @ApiPropertyOptional({ example: 'Нужен трансфер' })
  @IsOptional()
  @IsString()
  note?: string | null;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  participantId: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  programId: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  shiftId: number;
}

export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {}

export class ApplicationResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ enum: ApplicationStatus, example: ApplicationStatus.NEW })
  status: ApplicationStatus;

  @ApiProperty({ example: true })
  medicalApproved: boolean;

  @ApiProperty({ example: true })
  parentConsent: boolean;

  @ApiPropertyOptional({ example: 'Нужен трансфер' })
  note: string | null;

  @ApiProperty({ example: '2026-04-15T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: 1 })
  participantId: number;

  @ApiProperty({ example: 1 })
  programId: number;

  @ApiProperty({ example: 1 })
  shiftId: number;
}

export class ApplicationListResponseDto extends PaginationMetaDto {
  @ApiProperty({ type: ApplicationResponseDto, isArray: true })
  items: ApplicationResponseDto[];
}
