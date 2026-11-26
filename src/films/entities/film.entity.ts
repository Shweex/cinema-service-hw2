import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Showing } from '../../showings/entities/showing.entity.js';

@Entity('films')
export class Film {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ name: 'duration_minutes', type: 'integer' })
  durationMinutes: number;

  @Column({ name: 'release_year', type: 'integer' })
  releaseYear: number;

  @OneToMany('Showing', 'film')
  showings: Showing[];
}
