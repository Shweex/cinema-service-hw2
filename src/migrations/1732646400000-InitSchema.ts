import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1732646400000 implements MigrationInterface {
  name = 'InitSchema1732646400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE "films" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" character varying NOT NULL,
        "duration_minutes" integer NOT NULL,
        "release_year" integer NOT NULL,
        CONSTRAINT "PK_films_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "halls" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "rows" integer NOT NULL,
        "seats_per_row" integer NOT NULL,
        CONSTRAINT "PK_halls_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_halls_name" UNIQUE ("name")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "showings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "film_id" uuid NOT NULL,
        "hall_id" uuid NOT NULL,
        "starts_at" TIMESTAMPTZ NOT NULL,
        "price" integer NOT NULL,
        CONSTRAINT "PK_showings_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_showings_film_id"
          FOREIGN KEY ("film_id") REFERENCES "films"("id"),
        CONSTRAINT "FK_showings_hall_id"
          FOREIGN KEY ("hall_id") REFERENCES "halls"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "bookings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "showing_id" uuid NOT NULL,
        "total_price" integer NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bookings_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_bookings_showing_id"
          FOREIGN KEY ("showing_id") REFERENCES "showings"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "booking_seats" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "booking_id" uuid NOT NULL,
        "showing_id" uuid NOT NULL,
        "row" integer NOT NULL,
        "seat" integer NOT NULL,
        CONSTRAINT "PK_booking_seats_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_booking_seats_booking_id"
          FOREIGN KEY ("booking_id") REFERENCES "bookings"("id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_booking_seats_showing_id"
          FOREIGN KEY ("showing_id") REFERENCES "showings"("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_booking_seats_showing_row_seat"
      ON "booking_seats" ("showing_id", "row", "seat")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_booking_seats_showing_row_seat"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "booking_seats"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bookings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "showings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "halls"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "films"`);
  }
}
