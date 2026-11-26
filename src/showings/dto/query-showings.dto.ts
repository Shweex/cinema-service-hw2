import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class QueryShowingsDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  filmId?: string;

  @ApiPropertyOptional({
    example: '2030-06-15',
    description: 'Filter by start day (YYYY-MM-DD)',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be in YYYY-MM-DD format',
  })
  date?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number (starting from 1)',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Page size (1-100)',
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    description: 'Sort by startsAt',
    default: 'asc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort?: 'asc' | 'desc';
}
