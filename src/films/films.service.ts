import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Showing } from '../showings/entities/showing.entity.js';
import { CreateFilmDto } from './dto/create-film.dto.js';
import { UpdateFilmDto } from './dto/update-film.dto.js';
import { Film } from './entities/film.entity.js';

@Injectable()
export class FilmsService {
  constructor(
    @InjectRepository(Film)
    private readonly filmsRepository: Repository<Film>,
    @InjectRepository(Showing)
    private readonly showingsRepository: Repository<Showing>,
  ) {}

  async create(dto: CreateFilmDto): Promise<Film> {
    const film = this.filmsRepository.create({
      title: dto.title,
      durationMinutes: dto.durationMinutes,
      releaseYear: dto.releaseYear,
    });
    return this.filmsRepository.save(film);
  }

  async findAll(): Promise<Film[]> {
    return this.filmsRepository.find({
      order: { title: 'ASC', id: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Film> {
    const film = await this.filmsRepository.findOne({ where: { id } });
    if (!film) {
      throw new NotFoundException(`Film with id ${id} not found`);
    }
    return film;
  }

  async findOneOrNull(id: string): Promise<Film | null> {
    return this.filmsRepository.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateFilmDto): Promise<Film> {
    const film = await this.findOne(id);
    if (dto.title !== undefined) {
      film.title = dto.title;
    }
    if (dto.durationMinutes !== undefined) {
      film.durationMinutes = dto.durationMinutes;
    }
    if (dto.releaseYear !== undefined) {
      film.releaseYear = dto.releaseYear;
    }
    return this.filmsRepository.save(film);
  }

  async remove(id: string): Promise<void> {
    const film = await this.findOne(id);
    const referenced = await this.showingsRepository.exists({
      where: { filmId: id },
    });
    if (referenced) {
      throw new ConflictException(
        `Film with id ${id} cannot be deleted because it is referenced by at least one showing`,
      );
    }
    await this.filmsRepository.remove(film);
  }
}
