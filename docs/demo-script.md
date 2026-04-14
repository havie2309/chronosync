# ChronoSync Demo Script

Use this script for a short demo video, live walkthrough, or interview explanation.

## Demo Goal

Show that ChronoSync can turn messy natural-language goals into reviewed tasks, save them, schedule them into a weekly plan, and expose basic operational metrics.

## Local Setup Before Demo

Run backend:

```powershell
cd E:\chronosync\apps\backend
npm run dev
```

Run frontend:

```powershell
cd E:\chronosync\apps\frontend
npm run dev
```

Open:

```text
http://localhost:5173
```

## Demo Prompt

Use this input on the Goals page:

```text
study physics 3 times this week, gym on 2 evenings, finish math assignment before Friday
```

## Walkthrough

### 1. Login

Show:
- temporary demo login screen
- `Continue as Demo User`

Say:

```text
For the MVP, I use a temporary demo auth flow. The backend is already structured around authenticated, user-scoped routes, so Firebase Auth can replace this later.
```

### 2. Parse Goals

Go to:

```text
/goals
```

Show:
- messy natural-language input
- `Parse Goals`
- parsed task cards

Say:

```text
The parser turns messy text into structured task suggestions. Right now this uses a free mock parser so development is not blocked by API billing, but the route and service boundary are ready for OpenAI.
```

### 3. Review And Edit Tasks

Show:
- editable title
- duration
- priority
- preferred time window
- status

Say:

```text
I intentionally keep a human review step. AI suggests tasks, but the user confirms and edits before anything is persisted.
```

### 4. Save Reviewed Tasks

Click:

```text
Save Reviewed Tasks
```

Show:
- success message

Say:

```text
The reviewed tasks are saved through a bulk endpoint. The backend validates and normalizes them before writing to PostgreSQL.
```

### 5. View Tasks

Go to:

```text
/tasks
```

Show:
- task summary cards
- status filters
- edit and delete actions

Say:

```text
The Tasks page supports the full basic CRUD loop: list, edit, delete, and status filtering.
```

### 6. Generate Planner Schedule

Go to:

```text
/planner
```

Show:
- week picker
- summary cards
- `Generate Schedule`
- generated agenda blocks

Say:

```text
The scheduler is deterministic and separate from the parser. It sorts tasks by urgency and priority, creates time blocks, prevents duplicate blocks on regeneration, and updates task status.
```

### 7. Reset And Regenerate

Show:
- `Reset Week`
- `Reset & Regenerate`

Say:

```text
Resetting a week removes generated blocks and returns linked tasks to pending, which keeps task state and planner state consistent.
```

### 8. Metrics

Go to:

```text
/metrics
```

Show:
- task counts
- schedule counts
- task status bars
- schedule coverage
- refresh button

Say:

```text
The metrics page reads from a backend summary endpoint and gives lightweight observability into task and scheduling activity.
```

### 9. Health

Go to:

```text
/health
```

Show:
- API status
- database status
- check health button

Say:

```text
The detailed health check verifies both the Express API and PostgreSQL connectivity through Prisma.
```

## Strong Technical Points To Mention

- React frontend with protected routes and temporary auth context
- Express backend with route/controller/service structure
- PostgreSQL persistence through Prisma
- normalized tables for users, tasks, time blocks, scheduler runs, and logs
- deterministic scheduling separate from AI parsing
- user-reviewed parsing flow before persistence
- request logging and rate limiting
- metrics and health endpoints for observability

## Current MVP Limitations

- Firebase Auth is not wired yet
- OpenAI parsing is mocked for now
- Google Calendar sync is not implemented yet
- planner uses agenda cards instead of FullCalendar drag/drop
- rate limiting is in-memory, not Redis-backed

## Closing Line

```text
ChronoSync currently demonstrates the full core loop: messy goals to structured tasks, reviewed persistence, deterministic weekly scheduling, and operational visibility through metrics and health checks.
```
