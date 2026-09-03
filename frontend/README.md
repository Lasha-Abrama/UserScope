# UserScope Frontend

UserScope is a responsive Next.js admin workspace for managing the NestJS/MongoDB user directory.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

The frontend runs at [http://localhost:3001](http://localhost:3001) and expects the backend at `http://localhost:3000`.

`.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Start the backend separately from `../` with `npm run start:dev`. Ensure its `FRONTEND_URL` is `http://localhost:3001`.

## Features

- Dashboard totals and gender distribution from server-side API queries.
- Search by name, exact age, age range, and gender.
- Server-side pagination with 10, 20, 50, or 100 rows per page.
- Safe sorting by name, age, or created date.
- Add, edit, view, and confirmed-delete user flows.
- Loading, error, empty, success, and retry states.
- Swagger link at the backend's `/api/docs` route.
- Responsive table and mobile navigation.

## Backend examples

```text
GET /users?page=2&limit=20
GET /users?name=John&gender=f
GET /users?ageFrom=20&ageTo=30&sortBy=age&order=desc
GET /total-users
```

For the full API and seed instructions, see the backend README in the parent directory.
