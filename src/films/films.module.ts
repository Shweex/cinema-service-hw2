import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Showing } from '../showings/entities/showing.entity.js';
import { Film } from './entities/film.entity.js';
import { FilmsController } from './films.controller.js';
import { FilmsService } from './films.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Film, Showing])],
  controllers: [FilmsController],
  providers: [FilmsService],
  exports: [FilmsService],
})
export class FilmsModule {}
