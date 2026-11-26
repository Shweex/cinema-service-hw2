import dataSource from './data-source.js';
import { BookingSeat } from './bookings/entities/booking-seat.entity.js';
import { Booking } from './bookings/entities/booking.entity.js';
import { Film } from './films/entities/film.entity.js';
import { Hall } from './halls/entities/hall.entity.js';
import { Showing } from './showings/entities/showing.entity.js';

const SEED = {
  films: [
    {
      id: '11111111-1111-4111-8111-111111111111',
      title: 'Inception',
      durationMinutes: 148,
      releaseYear: 2010,
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      title: 'Interstellar',
      durationMinutes: 169,
      releaseYear: 2014,
    },
  ],
  halls: [
    {
      id: '33333333-3333-4333-8333-333333333333',
      name: 'Red Hall',
      rows: 5,
      seatsPerRow: 8,
    },
    {
      id: '44444444-4444-4444-8444-444444444444',
      name: 'Blue Hall',
      rows: 4,
      seatsPerRow: 6,
    },
  ],
  showings: [
    {
      id: '55555555-5555-4555-8555-555555555551',
      filmId: '11111111-1111-4111-8111-111111111111',
      hallId: '33333333-3333-4333-8333-333333333333',
      startsAt: new Date('2030-06-15T18:30:00.000Z'),
      price: 12500,
    },
    {
      id: '55555555-5555-4555-8555-555555555552',
      filmId: '11111111-1111-4111-8111-111111111111',
      hallId: '44444444-4444-4444-8444-444444444444',
      startsAt: new Date('2030-06-16T12:00:00.000Z'),
      price: 10000,
    },
    {
      id: '55555555-5555-4555-8555-555555555553',
      filmId: '22222222-2222-4222-8222-222222222222',
      hallId: '33333333-3333-4333-8333-333333333333',
      startsAt: new Date('2030-06-17T20:00:00.000Z'),
      price: 15000,
    },
    {
      id: '55555555-5555-4555-8555-555555555554',
      filmId: '22222222-2222-4222-8222-222222222222',
      hallId: '44444444-4444-4444-8444-444444444444',
      startsAt: new Date('2030-06-18T16:45:00.000Z'),
      price: 11000,
    },
  ],
  booking: {
    id: '66666666-6666-4666-8666-666666666666',
    showingId: '55555555-5555-4555-8555-555555555551',
    totalPrice: 25000,
  },
  bookingSeats: [
    {
      id: '77777777-7777-4777-8777-777777777771',
      bookingId: '66666666-6666-4666-8666-666666666666',
      showingId: '55555555-5555-4555-8555-555555555551',
      row: 1,
      seat: 1,
    },
    {
      id: '77777777-7777-4777-8777-777777777772',
      bookingId: '66666666-6666-4666-8666-666666666666',
      showingId: '55555555-5555-4555-8555-555555555551',
      row: 1,
      seat: 2,
    },
  ],
};

async function seed(): Promise<void> {
  await dataSource.initialize();

  try {
    const filmsRepository = dataSource.getRepository(Film);
    const hallsRepository = dataSource.getRepository(Hall);
    const showingsRepository = dataSource.getRepository(Showing);
    const bookingsRepository = dataSource.getRepository(Booking);
    const bookingSeatsRepository = dataSource.getRepository(BookingSeat);

    for (const film of SEED.films) {
      const existing = await filmsRepository.findOne({
        where: { id: film.id },
      });
      if (!existing) {
        await filmsRepository.save(filmsRepository.create(film));
      }
    }

    for (const hall of SEED.halls) {
      const existing = await hallsRepository.findOne({
        where: { id: hall.id },
      });
      if (!existing) {
        await hallsRepository.save(hallsRepository.create(hall));
      }
    }

    for (const showing of SEED.showings) {
      const existing = await showingsRepository.findOne({
        where: { id: showing.id },
      });
      if (!existing) {
        await showingsRepository.save(showingsRepository.create(showing));
      }
    }

    const existingBooking = await bookingsRepository.findOne({
      where: { id: SEED.booking.id },
    });
    if (!existingBooking) {
      await bookingsRepository.save(
        bookingsRepository.create(SEED.booking),
      );
    }

    for (const seat of SEED.bookingSeats) {
      const existing = await bookingSeatsRepository.findOne({
        where: { id: seat.id },
      });
      if (!existing) {
        await bookingSeatsRepository.save(
          bookingSeatsRepository.create(seat),
        );
      }
    }

    console.log('Seed completed successfully');
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
