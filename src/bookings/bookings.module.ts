import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BOOKINGS_SERVICE } from '../common/tokens.js';
import { HallsModule } from '../halls/halls.module.js';
import { ShowingsModule } from '../showings/showings.module.js';
import { BookingsController } from './bookings.controller.js';
import { BookingsService } from './bookings.service.js';
import { BookingSeat } from './entities/booking-seat.entity.js';
import { Booking } from './entities/booking.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, BookingSeat]),
    forwardRef(() => ShowingsModule),
    HallsModule,
  ],
  controllers: [BookingsController],
  providers: [
    BookingsService,
    { provide: BOOKINGS_SERVICE, useExisting: BookingsService },
  ],
  exports: [BookingsService, BOOKINGS_SERVICE],
})
export class BookingsModule {}
