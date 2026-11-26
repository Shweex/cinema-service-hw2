import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { isUniqueViolation } from '../common/db-errors.js';
import { HallsService } from '../halls/halls.service.js';
import { ShowingsService } from '../showings/showings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { BookingSeat } from './entities/booking-seat.entity.js';
import {
  Booking,
  BookingSeatView,
  BookingView,
} from './entities/booking.entity.js';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
    @InjectRepository(BookingSeat)
    private readonly bookingSeatsRepository: Repository<BookingSeat>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly showingsService: ShowingsService,
    private readonly hallsService: HallsService,
  ) {}

  async findAll(): Promise<BookingView[]> {
    const bookings = await this.bookingsRepository.find({
      relations: { seats: true },
      order: { createdAt: 'ASC', id: 'ASC' },
    });
    return bookings.map((booking) => this.toView(booking));
  }

  async findByShowing(showingId: string): Promise<BookingView[]> {
    await this.showingsService.findEntity(showingId);
    const bookings = await this.bookingsRepository.find({
      where: { showingId },
      relations: { seats: true },
      order: { createdAt: 'ASC', id: 'ASC' },
    });
    return bookings.map((booking) => this.toView(booking));
  }

  async create(showingId: string, dto: CreateBookingDto): Promise<BookingView> {
    const showing = await this.showingsService.findEntity(showingId);
    const hall = await this.hallsService.findOne(showing.hallId);

    for (const seat of dto.seats) {
      if (!this.hallsService.isSeatInHall(hall, seat.row, seat.seat)) {
        throw new BadRequestException(
          `Seat row ${seat.row} seat ${seat.seat} is outside hall layout (${hall.rows}x${hall.seatsPerRow})`,
        );
      }
    }

    try {
      const booking = await this.dataSource.transaction(async (manager) => {
        const created = manager.create(Booking, {
          showingId,
          totalPrice: showing.price * dto.seats.length,
        });
        const savedBooking = await manager.save(created);

        const seats = dto.seats.map((seat) =>
          manager.create(BookingSeat, {
            bookingId: savedBooking.id,
            showingId,
            row: seat.row,
            seat: seat.seat,
          }),
        );
        await manager.save(seats);

        savedBooking.seats = seats;
        return savedBooking;
      });

      return this.toView(booking);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          'One or more seats are already booked for this showing',
        );
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const booking = await this.bookingsRepository.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }
    await this.bookingsRepository.remove(booking);
  }

  async getBookedSeatsForShowing(showingId: string): Promise<BookingSeatView[]> {
    const seats = await this.bookingSeatsRepository.find({
      where: { showingId },
    });
    return seats.map((seat) => ({ row: seat.row, seat: seat.seat }));
  }

  private toView(booking: Booking): BookingView {
    return {
      id: booking.id,
      showingId: booking.showingId,
      seats: (booking.seats ?? []).map((seat) => ({
        row: seat.row,
        seat: seat.seat,
      })),
      totalPrice: booking.totalPrice,
    };
  }
}
