import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsModule } from './bookings/bookings.module.js';
import { validateEnv } from './config/env.validation.js';
import { FilmsModule } from './films/films.module.js';
import { HallsModule } from './halls/halls.module.js';
import { ShowingsModule } from './showings/showings.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.getOrThrow<number>('DB_PORT'),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
        uuidExtension: 'pgcrypto' as const,
      }),
    }),
    FilmsModule,
    HallsModule,
    ShowingsModule,
    BookingsModule,
  ],
})
export class AppModule {}
