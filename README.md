# UserScope API

UserScope is a NestJS and MongoDB REST API for managing and exploring a large user dataset. It includes validated CRUD operations, filtering, pagination, sorting, request timing, in-memory read caching, and a batch seeder for 150,000 users.

## Technologies

- NestJS and TypeScript
- MongoDB, Mongoose, and `@nestjs/mongoose`
- `class-validator` and `class-transformer`
- `@nestjs/cache-manager`
- Faker
- Swagger/OpenAPI

## Setup

```bash
npm install
cp .env.example .env
```

Configure `.env`:

```dotenv
MONGODB_URL=mongodb://localhost:27017/userscope
FRONTEND_URL=http://localhost:3000
PORT=3000
```

Use either a running local MongoDB instance or replace `MONGODB_URL` with a MongoDB Atlas connection string. Never commit `.env`.

## Run

```bash
npm run start:dev
```

The API defaults to `http://localhost:3000`. Swagger documentation is available at `http://localhost:3000/api/docs`.

## Seed data

```bash
npm run seed
```

The explicit seed command clears the users collection and inserts exactly 150,000 users in batches. It is not executed during application startup.

Verify the result:

```bash
curl http://localhost:3000/total-users
```

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/users` | Create a user |
| `GET` | `/users` | List, filter, sort, and paginate users |
| `GET` | `/users/:id` | Get one user |
| `PATCH` | `/users/:id` | Update one user |
| `DELETE` | `/users/:id` | Delete one user |
| `GET` | `/total-users` | Count all users |

## Filtering, pagination, and sorting

```text
GET /users?page=2&limit=20
GET /users?age=25
GET /users?ageFrom=20&ageTo=30
GET /users?gender=m
GET /users?name=John
GET /users?ageFrom=20&ageTo=30&gender=f&name=a&page=1&limit=20
GET /users?sortBy=age&order=desc
```

`page` defaults to `1`. `limit` defaults to `20` and must be between `1` and `100`. Exact `age` takes priority over `ageFrom` and `ageTo`. Name matching is case-insensitive across first and last names. Allowed sort fields are `firstName`, `lastName`, `age`, and `createdAt`.

## Performance behavior

- The `age` field has a MongoDB ascending index.
- List, individual-user, and total-count reads are cached in memory for 30 seconds.
- Successful create, update, and delete operations clear user read caches.
- Every HTTP response logs its method, URL, status code, and duration.

## Quality checks

```bash
npm run format
npm run build
npm run lint
npm test
npm run test:e2e
```
