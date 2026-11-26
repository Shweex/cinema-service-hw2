import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilmsService } from '../films/films.service.js';
import { HallsService } from '../halls/halls.service.js';
import { CreateShowingDto } from './dto/create-showing.dto.js';
import type { PaginatedShowingsDto } from './dto/paginated-showings.dto.js';
import { QueryShowingsDto } from './dto/query-showings.dto.js';
import {
  SeatAvailability,
  Showing,
  ShowingView,
} from './entities/showing.entity.js';

export interface BookedSeatRef {
  row: number;
  seat: number;
}

@Injectable()
export class ShowingsService {
  constructor(
    @InjectRepository(Showing)
    private readonly showingsRepository: Repository<Showing>,
    private readonly filmsService: FilmsService,
    private readonly hallsService: HallsService,
  ) {}

  async create(dto: CreateShowingDto): Promise<Showing> {
    const film = await this.filmsService.findOneOrNull(dto.filmId);
    if (!film) {
      throw new BadRequestException(`Film with id ${dto.filmId} not found`);
    }

    const hall = await this.hallsService.findOneOrNull(dto.hallId);
    if (!hall) {
      throw new BadRequestException(`Hall with id ${dto.hallId} not found`);
    }

    const startsAtDate = new Date(dto.startsAt);
    if (Number.isNaN(startsAtDate.getTime())) {
      throw new BadRequestException('startsAt must be a valid ISO 8601 date');
    }
    if (startsAtDate.getTime() <= Date.now()) {
      throw new BadRequestException('startsAt must be in the future');
    }

    const showing = this.showingsRepository.create({
      filmId: dto.filmId,
      hallId: dto.hallId,
      startsAt: startsAtDate,
      price: dto.price,
    });
    return this.showingsRepository.save(showing);
  }

  async findAll(query: QueryShowingsDto): Promise<PaginatedShowingsDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sort = query.sort ?? 'asc';

    const qb = this.showingsRepository
      .createQueryBuilder('showing')
      .leftJoinAndSelect('showing.film', 'film')
      .leftJoinAndSelect('showing.hall', 'hall');

    if (query.filmId) {
      qb.andWhere('showing.film_id = :filmId', { filmId: query.filmId });
    }

    if (query.date) {
      const from = new Date(`${query.date}T00:00:00.000Z`);
      const to = new Date(from);
      to.setUTCDate(to.getUTCDate() + 1);
      qb.andWhere('showing.starts_at >= :from AND showing.starts_at < :to', {
        from,
        to,
      });
    }

    qb.orderBy('showing.starts_at', sort.toUpperCase() as 'ASC' | 'DESC').addOrderBy(
      'showing.id',
      sort.toUpperCase() as 'ASC' | 'DESC',
    );

    qb.skip((page - 1) * limit).take(limit);

    const [showings, total] = await qb.getManyAndCount();

    return {
      items: showings.map((showing) => this.toView(showing)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<ShowingView> {
    const showing = await this.showingsRepository.findOne({
      where: { id },
      relations: { film: true, hall: true },
    });
    if (!showing) {
      throw new NotFoundException(`Showing with id ${id} not found`);
    }
    return this.toView(showing);
  }

  async findEntity(id: string): Promise<Showing> {
    const showing = await this.showingsRepository.findOne({ where: { id } });
    if (!showing) {
      throw new NotFoundException(`Showing with id ${id} not found`);
    }
    return showing;
  }

  async findEntityOrNull(id: string): Promise<Showing | null> {
    return this.showingsRepository.findOne({ where: { id } });
  }

  async buildSeatAvailability(
    id: string,
    bookedSeats: BookedSeatRef[],
  ): Promise<SeatAvailability[]> {
    const showing = await this.findEntity(id);
    const hall = await this.hallsService.findOne(showing.hallId);
    const bookedKeys = new Set(
      bookedSeats.map((seat) => `${seat.row}:${seat.seat}`),
    );

    return this.hallsService
      .buildSeats(hall.rows, hall.seatsPerRow)
      .map((seat) => ({
        row: seat.row,
        seat: seat.seat,
        isBooked: bookedKeys.has(`${seat.row}:${seat.seat}`),
      }));
  }

  private toView(showing: Showing): ShowingView {
    return {
      id: showing.id,
      filmTitle: showing.film.title,
      hallName: showing.hall.name,
      startsAt: showing.startsAt.toISOString(),
      price: showing.price,
    };
  }
}
