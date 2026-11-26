import 'dotenv/config';
import { DataSource } from 'typeorm';
import { BookingSeat } from './bookings/entities/booking-seat.entity.js';
import { Booking } from './bookings/entities/booking.entity.js';
import { Film } from './films/entities/film.entity.js';
import { Hall } from './halls/entities/hall.entity.js';
import { Showing } from './showings/entities/showing.entity.js';

const port = Number(process.env.DB_PORT);

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number.isFinite(port) ? port : 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Film, Hall, Showing, Booking, BookingSeat],
  migrations: ['src/migrations/*.ts'],
});
