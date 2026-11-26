import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Showing } from '../../showings/entities/showing.entity.js';
import { Booking } from './booking.entity.js';

@Entity('booking_seats')
@Index(['showingId', 'row', 'seat'], { unique: true })
export class BookingSeat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @Column({ name: 'showing_id', type: 'uuid' })
  showingId: string;

  @Column({ type: 'integer' })
  row: number;

  @Column({ type: 'integer' })
  seat: number;

  @ManyToOne(() => Booking, (booking) => booking.seats, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ManyToOne(() => Showing, (showing) => showing.bookingSeats, {
    nullable: false,
  })
  @JoinColumn({ name: 'showing_id' })
  showing: Showing;
}
