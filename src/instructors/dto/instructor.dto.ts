import { PartialType } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';

export class CreateInstructorDto {
  @ApiProperty({ example: 'Расул Алиев' })
  @IsString()
  @Length(1, 120)
  fullName: string;

  @ApiProperty({ example: 'альпинизм' })
  @IsString()
  @Length(1, 80)
  specialization: string;

  @ApiProperty({ example: 6 })
  @IsInt()
  @IsPositive()
  experienceYears: number;

  @ApiPropertyOptional({ example: '+79995555555' })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string | null;

  @ApiPropertyOptional({ example: 'rasul@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string | null;
}

export class UpdateInstructorDto extends PartialType(CreateInstructorDto) {}

export class InstructorResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Расул Алиев' })
  fullName: string;

  @ApiProperty({ example: 'альпинизм' })
  specialization: string;

  @ApiProperty({ example: 6 })
  experienceYears: number;

  @ApiPropertyOptional({ example: '+79995555555' })
  phone: string | null;

  @ApiPropertyOptional({ example: 'rasul@example.com' })
  email: string | null;
}

export class InstructorListResponseDto extends PaginationMetaDto {
  @ApiProperty({ type: InstructorResponseDto, isArray: true })
  items: InstructorResponseDto[];
}
