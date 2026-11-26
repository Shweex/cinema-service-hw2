import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { BookingSeat } from '../../bookings/entities/booking-seat.entity.js';
import type { Booking } from '../../bookings/entities/booking.entity.js';
import { Film } from '../../films/entities/film.entity.js';
import { Hall } from '../../halls/entities/hall.entity.js';

export interface ShowingView {
  id: string;
  filmTitle: string;
  hallName: string;
  startsAt: string;
  price: number;
}

export interface SeatAvailability {
  row: number;
  seat: number;
  isBooked: boolean;
}

@Entity('showings')
export class Showing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'film_id', type: 'uuid' })
  filmId: string;

  @Column({ name: 'hall_id', type: 'uuid' })
  hallId: string;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt: Date;

  @Column({ type: 'integer' })
  price: number;

  @ManyToOne(() => Film, (film) => film.showings, { nullable: false })
  @JoinColumn({ name: 'film_id' })
  film: Film;

  @ManyToOne(() => Hall, (hall) => hall.showings, { nullable: false })
  @JoinColumn({ name: 'hall_id' })
  hall: Hall;

  @OneToMany('Booking', 'showing')
  bookings: Booking[];

  @OneToMany('BookingSeat', 'showing')
  bookingSeats: BookingSeat[];
}
