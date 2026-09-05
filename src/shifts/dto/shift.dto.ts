import { PartialType } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';

export class CreateShiftDto {
  @ApiProperty({ example: 'Июньская смена' })
  @IsString()
  @Length(1, 80)
  name: string;

  @ApiProperty({ example: '2026-06-10' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-06-24' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 40 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  capacity: number;

  @ApiProperty({ example: 18 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  availablePlaces: number;

  @ApiProperty({ example: 'лето' })
  @IsString()
  @Length(1, 20)
  season: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  programId: number;

  @ApiPropertyOptional({ example: [1, 2], type: [Number] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  @IsPositive({ each: true })
  instructorIds?: number[];
}

export class UpdateShiftDto extends PartialType(CreateShiftDto) {}

export class ShiftResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Июньская смена' })
  name: string;

  @ApiProperty({ example: '2026-06-10' })
  startDate: string;

  @ApiProperty({ example: '2026-06-24' })
  endDate: string;

  @ApiProperty({ example: 40 })
  capacity: number;

  @ApiProperty({ example: 18 })
  availablePlaces: number;

  @ApiProperty({ example: 'лето' })
  season: string;

  @ApiProperty({ example: 1 })
  programId: number;

  @ApiProperty({ example: [1, 2], type: [Number] })
  instructorIds: number[];
}

export class ShiftListResponseDto extends PaginationMetaDto {
  @ApiProperty({ type: ShiftResponseDto, isArray: true })
  items: ShiftResponseDto[];
}
