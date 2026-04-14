# ChronoSync API Routes

Base URL for local development:

```text
http://localhost:4000/api
```

Most application routes currently use temporary demo auth with:

```text
x-user-email: demo@chronosync.dev
```

This header will be replaced later by Firebase ID token validation.

## Health

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Lightweight API liveness check |
| `GET` | `/health/details` | No | Checks API and PostgreSQL connectivity |

Example:

```powershell
Invoke-RestMethod http://localhost:4000/api/health/details
```

## Auth

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/session` | No | Create or fetch a user session |
| `GET` | `/auth/me` | Yes | Return the current authenticated user |

Create session body:

```json
{
  "email": "demo@chronosync.dev",
  "name": "Demo User",
  "photoUrl": "https://example.com/avatar.png"
}
```

## Tasks

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/tasks/parse` | Yes | Convert messy goal text into structured task suggestions |
| `POST` | `/tasks/bulk` | Yes | Save reviewed tasks in one request |
| `POST` | `/tasks` | Yes | Create one task |
| `GET` | `/tasks` | Yes | List current user's tasks |
| `PATCH` | `/tasks/:id` | Yes | Update one owned task |
| `DELETE` | `/tasks/:id` | Yes | Delete one owned task |

Parse body:

```json
{
  "text": "study physics 3 times this week, gym on 2 evenings, finish math assignment before Friday"
}
```

Bulk save body:

```json
{
  "tasks": [
    {
      "title": "Study physics",
      "durationMinutes": 90,
      "priority": 2,
      "preferredTimeWindow": "evening",
      "status": "pending"
    }
  ]
}
```

Update body:

```json
{
  "status": "in_progress",
  "durationMinutes": 120
}
```

## Schedule

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/schedule/generate` | Yes | Generate weekly scheduled time blocks |
| `POST` | `/schedule/reset` | Yes | Delete generated blocks for a week and return tasks to pending |
| `GET` | `/schedule/week` | Yes | Read scheduled blocks for a week |

Generate body:

```json
{
  "weekStart": "2026-04-13"
}
```

The `weekStart` field is optional. If omitted, the backend chooses a default week start.

Read week example:

```powershell
Invoke-RestMethod -Method GET `
  -Uri "http://localhost:4000/api/schedule/week?weekStart=2026-04-13" `
  -Headers @{ "x-user-email" = "demo@chronosync.dev" }
```

## Metrics

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/metrics/summary` | Yes | Return task and schedule summary metrics |

Metrics response shape:

```json
{
  "tasks": {
    "total": 0,
    "pending": 0,
    "inProgress": 0,
    "scheduled": 0
  },
  "schedule": {
    "totalTimeBlocks": 0,
    "currentWeekTimeBlocks": 0,
    "schedulerRuns": 0,
    "lastSchedulerRunAt": null
  }
}
```

## Rate-Limited Routes

The backend currently uses lightweight in-memory rate limiting for heavier routes:

| Route | Limit |
| --- | --- |
| `POST /tasks/parse` | 10 requests per minute |
| `POST /tasks/bulk` | 20 requests per minute |
| `POST /schedule/generate` | 8 requests per minute |
| `POST /schedule/reset` | 8 requests per minute |

When a request is limited, the API returns:

```json
{
  "error": "Too many requests. Please try again shortly.",
  "retryAfterSeconds": 43
}
```
