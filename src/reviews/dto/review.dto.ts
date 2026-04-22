import { PartialType } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';

export class CreateReviewDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Очень понравилась программа' })
  @IsString()
  comment: string;

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
}

export class UpdateReviewDto extends PartialType(CreateReviewDto) {}

export class ReviewResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 5 })
  rating: number;

  @ApiProperty({ example: 'Очень понравилась программа' })
  comment: string;

  @ApiProperty({ example: '2026-04-15T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: 1 })
  participantId: number;

  @ApiProperty({ example: 1 })
  programId: number;
}

export class ReviewListResponseDto extends PaginationMetaDto {
  @ApiProperty({ type: ReviewResponseDto, isArray: true })
  items: ReviewResponseDto[];
}
