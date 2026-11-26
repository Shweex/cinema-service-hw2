import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUniqueViolation } from '../common/db-errors.js';
import { Showing } from '../showings/entities/showing.entity.js';
import { CreateHallDto } from './dto/create-hall.dto.js';
import { Hall, HallWithSeats, Seat } from './entities/hall.entity.js';

@Injectable()
export class HallsService {
  constructor(
    @InjectRepository(Hall)
    private readonly hallsRepository: Repository<Hall>,
    @InjectRepository(Showing)
    private readonly showingsRepository: Repository<Showing>,
  ) {}

  async create(dto: CreateHallDto): Promise<Hall> {
    const hall = this.hallsRepository.create({
      name: dto.name,
      rows: dto.rows,
      seatsPerRow: dto.seatsPerRow,
    });

    try {
      return await this.hallsRepository.save(hall);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          `Hall with name "${dto.name}" already exists`,
        );
      }
      throw error;
    }
  }

  async findAll(): Promise<Hall[]> {
    return this.hallsRepository.find({
      order: { name: 'ASC', id: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Hall> {
    const hall = await this.hallsRepository.findOne({ where: { id } });
    if (!hall) {
      throw new NotFoundException(`Hall with id ${id} not found`);
    }
    return hall;
  }

  async findOneOrNull(id: string): Promise<Hall | null> {
    return this.hallsRepository.findOne({ where: { id } });
  }

  async findOneWithSeats(id: string): Promise<HallWithSeats> {
    const hall = await this.findOne(id);
    return {
      id: hall.id,
      name: hall.name,
      rows: hall.rows,
      seatsPerRow: hall.seatsPerRow,
      seats: this.buildSeats(hall.rows, hall.seatsPerRow),
    };
  }

  buildSeats(rows: number, seatsPerRow: number): Seat[] {
    const seats: Seat[] = [];
    for (let row = 1; row <= rows; row += 1) {
      for (let seat = 1; seat <= seatsPerRow; seat += 1) {
        seats.push({ row, seat });
      }
    }
    return seats;
  }

  isSeatInHall(hall: Hall, row: number, seat: number): boolean {
    return (
      Number.isInteger(row) &&
      Number.isInteger(seat) &&
      row >= 1 &&
      seat >= 1 &&
      row <= hall.rows &&
      seat <= hall.seatsPerRow
    );
  }

  async remove(id: string): Promise<void> {
    const hall = await this.findOne(id);
    const referenced = await this.showingsRepository.exists({
      where: { hallId: id },
    });
    if (referenced) {
      throw new ConflictException(
        `Hall with id ${id} cannot be deleted because it is referenced by at least one showing`,
      );
    }
    await this.hallsRepository.remove(hall);
  }
}
