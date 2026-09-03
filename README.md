# UserScope

UserScope is a full-stack user analytics dashboard built around a NestJS API and a responsive Next.js frontend. It demonstrates production-minded CRUD, server-side search, pagination, caching, indexing, and a realistic 150,000-user dataset.

## Screenshots

_Add dashboard and users-page screenshots here before publishing the portfolio project._

## Architecture

`Next.js (Vercel)` → `NestJS (Render/Railway)` → `Mongoose` → `MongoDB Atlas`

## Midterm Requirements

| Requirement | Implementation |
| --- | --- |
| Users CRUD | `src/users/users.controller.ts` and `users.service.ts` |
| Exactly 150,000 Faker users | `src/seed.ts`, `npm run seed`, batched `insertMany` |
| Request execution timing | `src/common/middleware/request-logger.middleware.ts` |
| Read caching and mutation invalidation | `src/users/users.service.ts` with Nest cache-manager |
| Total user count | `GET /total-users` uses `countDocuments()` |
| Age index | `src/users/schemas/user.schema.ts` defines `{ age: 1 }` |
| Exact age, range, gender, and regex name filters | `FindUsersQueryDto` and `UsersService.buildFilter()` |
| Safe pagination | `find().skip().limit()` with defaults and limits in `FindUsersQueryDto` |

## Technologies

- NestJS and TypeScript
- MongoDB, Mongoose, and `@nestjs/mongoose`
- `class-validator` and `class-transformer`
- `@nestjs/cache-manager`
- Faker
- Swagger/OpenAPI
- Next.js App Router, Tailwind CSS, and Lucide icons

## Setup

```bash
npm install
cp .env.example .env
```

Configure `.env`:

```dotenv
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/userscope
MONGODB_DATABASE=userscope
FRONTEND_URL=http://localhost:3001
PORT=3000
```

Use either a running local MongoDB instance or replace `MONGODB_URL` with a MongoDB Atlas connection string. Never commit `.env`.

For the dashboard, configure the frontend separately:

```bash
cd frontend
npm install
cp .env.example .env.local
```

Set `NEXT_PUBLIC_API_URL=http://localhost:3000` in `frontend/.env.local`.

## Run

```bash
npm run start:dev
# in a second terminal
cd frontend && npm run dev
```

The API defaults to `http://localhost:3000`; the frontend runs at `http://localhost:3001`. Swagger documentation is available at `http://localhost:3000/api/docs`, and the health check is at `http://localhost:3000/health`.

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
| `GET` | `/stats` | Dashboard statistics |
| `GET` | `/health` | Lightweight service health check |

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

## Frontend

The dashboard provides total/male/female/average-age statistics, a paginated users table, debounced name search, age and gender filters, safe sorting, create/edit forms, delete confirmation, user details, loading/error/empty states, and responsive layouts. All list filtering and pagination are performed by the API rather than downloading the full dataset.

## Quality checks

```bash
npm run format
npm run build
npm run lint
npm test
npm run test:e2e
```

## Production deployment

The backend can be deployed from this directory to Render or Railway:

```text
Build: npm install && npm run build
Start: npm run start:prod
```

The frontend lives in `frontend/` and can be deployed independently to Vercel with `frontend` as the Root Directory and `npm run build` as the build command. Set `NEXT_PUBLIC_API_URL` to the deployed backend URL and redeploy after changing it because `NEXT_PUBLIC_*` values are bundled at build time.

Configure MongoDB Atlas with a valid database user, a rotated password, and network access for the deployed backend. `0.0.0.0/0` is convenient but exposes the cluster to all IPs; prefer the hosting provider's narrower outbound-IP range when available.

Production variables:

```dotenv
# Backend
PORT=3000
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/userscope
MONGODB_DATABASE=userscope
FRONTEND_URL=https://gita-backend-eight.vercel.app

# Frontend
NEXT_PUBLIC_API_URL=https://gita-backend-11s2.onrender.com
```

The named `userscope` database is now selected explicitly. Existing records created before this setting was added may remain in Atlas's `test` database; migrate or rerun the explicit seed command intentionally if those records are needed in `userscope`. No automatic destructive migration is performed.

Production URLs (replace placeholders after deployment):

- Frontend: `https://gita-backend-eight.vercel.app/`
- API: `https://gita-backend-11s2.onrender.com`
- API docs: `https://gita-backend-11s2.onrender.com/api/docs`

The frontend must be redeployed whenever `NEXT_PUBLIC_API_URL` changes because public Next.js variables are bundled at build time.

## Project structure

```text
midterm_3/
├── src/                 # NestJS API, users feature, seed script
├── frontend/            # Next.js dashboard
├── .env.example         # safe backend template
└── README.md
```
