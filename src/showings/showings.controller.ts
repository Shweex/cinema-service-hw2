import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { BookingsService } from '../bookings/bookings.service.js';
import { BOOKINGS_SERVICE } from '../common/tokens.js';
import { CreateShowingDto } from './dto/create-showing.dto.js';
import { PaginatedShowingsDto } from './dto/paginated-showings.dto.js';
import { QueryShowingsDto } from './dto/query-showings.dto.js';
import type { SeatAvailability, Showing } from './entities/showing.entity.js';
import { ShowingsService } from './showings.service.js';

@ApiTags('showings')
@Controller('showings')
export class ShowingsController {
  constructor(
    private readonly showingsService: ShowingsService,
    @Inject(BOOKINGS_SERVICE)
    private readonly bookingsService: BookingsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a showing' })
  @ApiCreatedResponse({ description: 'Showing created' })
  @ApiBadRequestResponse({
    description: 'Invalid body, missing film/hall, or startsAt in the past',
  })
  create(@Body() dto: CreateShowingDto): Promise<Showing> {
    return this.showingsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List showings with filters, sorting and pagination',
  })
  @ApiOkResponse({
    description: 'Paginated showings with film and hall names',
    type: PaginatedShowingsDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid date, page, limit or sort query parameter',
  })
  findAll(@Query() query: QueryShowingsDto): Promise<PaginatedShowingsDto> {
    return this.showingsService.findAll(query);
  }

  @Get(':id/seats')
  @ApiOperation({ summary: 'Get seat availability for a showing' })
  @ApiOkResponse({ description: 'Seats with isBooked flag' })
  @ApiNotFoundResponse({ description: 'Showing not found' })
  async getSeats(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SeatAvailability[]> {
    const bookedSeats =
      await this.bookingsService.getBookedSeatsForShowing(id);
    return this.showingsService.buildSeatAvailability(id, bookedSeats);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a showing by id' })
  @ApiOkResponse({ description: 'Showing with film and hall names' })
  @ApiNotFoundResponse({ description: 'Showing not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.showingsService.findOne(id);
  }
}
