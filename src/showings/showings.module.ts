import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsModule } from '../bookings/bookings.module.js';
import { SHOWINGS_SERVICE } from '../common/tokens.js';
import { FilmsModule } from '../films/films.module.js';
import { HallsModule } from '../halls/halls.module.js';
import { Showing } from './entities/showing.entity.js';
import { ShowingsController } from './showings.controller.js';
import { ShowingsService } from './showings.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Showing]),
    FilmsModule,
    HallsModule,
    forwardRef(() => BookingsModule),
  ],
  controllers: [ShowingsController],
  providers: [
    ShowingsService,
    { provide: SHOWINGS_SERVICE, useExisting: ShowingsService },
  ],
  exports: [ShowingsService, SHOWINGS_SERVICE],
})
export class ShowingsModule {}
