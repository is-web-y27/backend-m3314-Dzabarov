import { PartialType } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';

export class CreateProgramDto {
  @ApiProperty({ example: 'Горный старт' })
  @IsString()
  @Length(1, 120)
  title: string;

  @ApiProperty({ example: 'Базовая туристическая программа для подростков' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'очно' })
  @IsString()
  @Length(1, 50)
  format: string;

  @ApiProperty({ example: 'начальный' })
  @IsString()
  @Length(1, 30)
  difficulty: string;

  @ApiProperty({ example: 14 })
  @IsNumber()
  @IsPositive()
  durationDays: number;

  @ApiProperty({ example: 25990 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateProgramDto extends PartialType(CreateProgramDto) {}

export class ProgramResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Горный старт' })
  title: string;

  @ApiProperty({ example: 'Базовая туристическая программа для подростков' })
  description: string;

  @ApiProperty({ example: 'очно' })
  format: string;

  @ApiProperty({ example: 'начальный' })
  difficulty: string;

  @ApiProperty({ example: 14 })
  durationDays: number;

  @ApiProperty({ example: 25990 })
  price: number;

  @ApiProperty({ example: true })
  isActive: boolean;
}

export class ProgramListResponseDto extends PaginationMetaDto {
  @ApiProperty({ type: ProgramResponseDto, isArray: true })
  items: ProgramResponseDto[];
}
