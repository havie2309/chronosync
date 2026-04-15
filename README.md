# ChronoSync

ChronoSync is a full-stack AI productivity planner that turns natural-language goals into structured tasks, schedules them into a weekly calendar, and syncs approved schedule blocks to Google Calendar.

Current local MVP supports:
- demo sign-in flow
- task parsing with a free mock parser
- editable task review and bulk save
- task CRUD
- weekly schedule generation/reset
- planner, tasks, metrics, and health pages

## Feature Walkthrough

### 1. Demo Login

ChronoSync currently uses a temporary demo sign-in flow so the full product loop can be developed before Firebase Auth is connected.

### 2. Natural-Language Goals

The Goals page accepts messy planning text such as:

```text
study physics 3 times this week, gym on 2 evenings, finish math assignment before Friday
```

The backend mock parser converts this into structured task suggestions. Users can review and edit parsed fields before saving them.

### 3. Task Management

The Tasks page shows saved tasks with:
- summary counts
- status filters
- inline editing
- delete actions
- visual status badges

### 4. Weekly Planner

The Planner page can:
- pick a week
- generate a deterministic schedule
- reset a week
- reset and regenerate
- show schedule summary cards
- render scheduled blocks in a clean agenda view

### 5. Metrics Dashboard

The Metrics page shows task and schedule visibility:
- total tasks
- pending / in-progress / scheduled tasks
- total time blocks
- current-week blocks
- scheduler run count
- simple status and schedule coverage visuals

### 6. Health Check

The Health page calls the backend details endpoint and verifies:
- API availability
- PostgreSQL connectivity through Prisma

## Technical Highlights

- React + Vite frontend with protected routes and shared app shell
- Express backend with route/controller/service separation
- PostgreSQL persistence through Prisma
- Zod request validation for API safety
- deterministic scheduler with backend tests
- request logging and rate limiting
- metrics and DB-aware health endpoints
- GitHub Actions CI for backend tests/build and frontend build

## Monorepo Structure

- `apps/frontend` - React frontend
- `apps/backend` - Express backend
- `packages/shared` - shared types/schemas/constants
- `docs` - product and architecture documentation
- `infra/db` - database planning
- `infra/deploy` - deployment planning

## Local Requirements

- Node.js
- npm
- PostgreSQL running locally
- a local PostgreSQL database named `chronosync`

## Environment Files

Create local env files from the examples:

- `apps/backend/.env`
- `apps/frontend/.env`

Backend example:

```env
PORT=4000
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/chronosync
```

Frontend example:

```env
VITE_API_URL=http://localhost:4000
```

Do not commit real `.env` files.

## Backend Setup

From `apps/backend`:

```powershell
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Backend runs at:

```text
http://localhost:4000
```

Useful checks:

```text
http://localhost:4000/api/health
http://localhost:4000/api/health/details
```

## Frontend Setup

From `apps/frontend`:

```powershell
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## Local Development Notes

Run frontend and backend in two separate terminals.

- backend terminal: `E:\chronosync\apps\backend`
- frontend terminal: `E:\chronosync\apps\frontend`

The current auth flow is temporary and uses a demo user plus the `x-user-email` request header. Firebase Auth will replace this later.

The current parser is a mock/rule-based parser so development is not blocked by OpenAI API billing. OpenAI can replace the parser implementation later without changing the main frontend flow.
