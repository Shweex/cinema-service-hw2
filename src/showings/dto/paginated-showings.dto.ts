import { ApiProperty } from '@nestjs/swagger';
import type { ShowingView } from '../entities/showing.entity.js';

export class ShowingViewDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Inception' })
  filmTitle: string;

  @ApiProperty({ example: 'Red Hall' })
  hallName: string;

  @ApiProperty({ example: '2030-06-15T18:30:00.000Z' })
  startsAt: string;

  @ApiProperty({ example: 12500 })
  price: number;
}

export class PaginatedShowingsDto {
  @ApiProperty({ type: [ShowingViewDto] })
  items: ShowingView[];

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;
}
