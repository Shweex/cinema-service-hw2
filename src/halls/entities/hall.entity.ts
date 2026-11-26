import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Showing } from '../../showings/entities/showing.entity.js';

export interface Seat {
  row: number;
  seat: number;
}

export interface HallWithSeats {
  id: string;
  name: string;
  rows: number;
  seatsPerRow: number;
  seats: Seat[];
}

@Entity('halls')
export class Hall {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'integer' })
  rows: number;

  @Column({ name: 'seats_per_row', type: 'integer' })
  seatsPerRow: number;

  @OneToMany('Showing', 'hall')
  showings: Showing[];
}
