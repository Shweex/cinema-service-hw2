import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Showing } from '../../showings/entities/showing.entity.js';
import type { BookingSeat } from './booking-seat.entity.js';

export interface BookingSeatView {
  row: number;
  seat: number;
}

export interface BookingView {
  id: string;
  showingId: string;
  seats: BookingSeatView[];
  totalPrice: number;
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'showing_id', type: 'uuid' })
  showingId: string;

  @Column({ name: 'total_price', type: 'integer' })
  totalPrice: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Showing, (showing) => showing.bookings, {
    nullable: false,
  })
  @JoinColumn({ name: 'showing_id' })
  showing: Showing;

  @OneToMany('BookingSeat', 'booking')
  seats: BookingSeat[];
}
