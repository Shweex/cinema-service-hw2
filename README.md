# Cinema Service (ДЗ2)

Сервіс бронювання місць на сеанси кінотеатру на NestJS. Дані зберігаються в PostgreSQL через TypeORM; схема створюється міграціями.

## Встановлення залежностей

```bash
npm install
```

## Підняття бази даних

```bash
docker compose up -d
```

## Застосування міграцій

```bash
npm run migration:run
```

## Засівання бази даних

```bash
npm run seed
```

Повторний запуск не створює дублікатів.

## Запуск у режимі розробки

```bash
npm run start:dev
```

API: `http://localhost:3000`  
Swagger: `http://localhost:3000/docs`

## Змінні оточення

Скопіюйте приклад і за потреби змініть значення:

```bash
cp .env.example .env
```

Приклад `.env`:

```env
# HTTP port the NestJS app listens on
PORT=3000

# PostgreSQL connection
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=cinema
DB_PASSWORD=cinema
DB_NAME=cinema
```

## Перевірка маршрутів

У корені репозиторію є `requests.http` — виконуйте запити згори вниз (VS Code REST Client / JetBrains HTTP Client). Ідентифікатори підставляються зі змінних файлу.

## Модулі

- `films` — фільми
- `halls` — зали та схема місць
- `showings` — сеанси, фільтрація та посторінкова видача
- `bookings` — бронювання місць у транзакції
