# VitalPath

A full-stack fitness tracker: log workouts and individual sets, track weight
over time, record nutrition with macros, and see it all summarised on a
dashboard.

**Live demo:** _coming soon_
**Demo login:** `demo@example.com` / `demopassword`

<img width="1846" height="912" alt="image" src="https://github.com/user-attachments/assets/5ae6e122-8e0a-496d-9e49-ab788b905143" />


---

## Features

- **Session-based authentication** — signup, login, logout with hashed
  session tokens in httpOnly cookies
- **Workout logging** — cardio sessions with duration and calories, plus
  per-exercise sets for strength training
- **Automatic calorie estimation** — when calories aren't entered, they're
  derived from the activity's MET value, the user's most recent bodyweight,
  and the duration
- **Adaptive set logging** — the set form changes shape based on what the
  exercise tracks: reps and weight, duration, or distance
- **Weight tracking** — history, trend chart, and total change
- **Nutrition** — per-day food log with calorie and macro totals
- **Dashboard** — today / this week / this month, driven by the URL

## Tech stack

| Layer     | Choice |
| --------- | ------ |
| Framework | Next.js 16 (App Router) |
| Language  | JavaScript |
| Database  | PostgreSQL 18, queried directly with `pg` — no ORM |
| Styling   | Tailwind CSS v4, shadcn/ui |
| Charts    | Recharts |
| Auth      | Custom session auth, bcrypt, httpOnly cookies |

## Data model

Eight tables. The design decisions worth calling out:

- **`workout_sets` is its own table**, not columns on `workouts`. Sets
  reference both a workout and an exercise, so one session can contain
  several exercises with several sets each.
- **`exercises` and `workout_types` are reference data** shared by all users,
  which is why their foreign keys use `ON DELETE RESTRICT` — deleting
  "Running" from the catalogue fails if anyone has logged a run. User-owned
  tables use `ON DELETE CASCADE`.
- **`tracking_type` on `exercises`** (`reps_weight` / `duration` /
  `distance`) drives both a CHECK constraint and the shape of the logging
  form.
- **All timestamps are `timestamptz`.** Plain `timestamp` discards the offset
  and silently shifts meaning across deployments.
- **Current weight is derived, not stored.** It's the most recent
  `weight_entries` row, so there's one source of truth.
- **Constraints are named**, so violations can be caught by name in the
  application and turned into useful messages — "You already logged a weight
  for that date" rather than a 500.

## Architecture notes

**Identity never comes from the client.** Every route and page reads the user
from the session cookie. No endpoint accepts a user id as a parameter, which
makes it structurally impossible to request another user's data.

**Middleware is a redirect convenience, not a security boundary.** It runs on
the Edge runtime where `pg` isn't available, so it can only check that a
cookie exists. The real check happens in the layout and in every service call.

**Session tokens are stored hashed.** The cookie holds 32 bytes of
`crypto.randomBytes`; the database stores only its SHA-256. A database leak
yields nothing usable. SHA-256 rather than bcrypt because the token is
already unguessable — bcrypt's slowness buys nothing and would cost on every
request.

**Server Components read the database directly.** Pages don't fetch their own
API. Writes go through Server Actions and `revalidatePath`, so there is no
client-side data fetching or loading state anywhere in the app.

**Business logic lives in `lib/services/`**, so route handlers and Server
Actions are thin adapters over the same functions.

## Local setup

Requires Node 20+ and PostgreSQL 16+.

```bash
git clone https://github.com/Krupalmewada/fitness_tracker.git
cd fitness_tracker
npm install
```

Create a `.env.local` file in the project root. These are placeholder values —
substitute your own local Postgres credentials:
```
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/fitness_tracker
```


Create the database and run the migrations in order:

```bash
createdb fitness_tracker
psql -U postgres -d fitness_tracker -f migrations/001_initial_schema.sql
psql -U postgres -d fitness_tracker -f migrations/002_seed_data.sql
psql -U postgres -d fitness_tracker -f migrations/003_updated_at_trigger.sql
psql -U postgres -d fitness_tracker -f migrations/004_sessions.sql
psql -U postgres -d fitness_tracker -f migrations/005_dob_range.sql
```

Then:

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

## Project structure

```
app/
  (auth)/          login and signup, split-screen layout
  (app)/           authenticated pages, sidebar layout
  api/             REST endpoints for external consumers
lib/
  db.js            connection pool and transaction helper
  session.js       token generation, lookup, deletion
  auth.js          cookie handling and getCurrentUser
  services/        business logic, shared by routes and actions
migrations/        numbered SQL, run in order
```


## Migrations

Numbered SQL files in `migrations/`, run in order. Each is wrapped in a
transaction and is re-runnable. Files that have been applied are never
edited — schema changes go in a new file.

## What I'd build next

- Rate limiting on login
- Email verification (the column exists, the flow doesn't)
- User-created custom exercises (nullable `user_id` on `exercises`)
- Keyset pagination — `OFFSET` degrades on large tables
- Daily calorie and macro targets computed from profile data

