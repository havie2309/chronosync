# ChronoSync Step 1: MVP Foundation

## 1. Project Summary
ChronoSync is a full-stack productivity planner that lets a user sign in with Google, enter messy natural-language goals, convert them into structured tasks using AI, auto-schedule those tasks into a weekly calendar, edit the schedule visually, and sync selected schedule blocks to Google Calendar.

## 2. MVP Scope

### Must Have
- Google login
- Natural-language goal input
- OpenAI-powered task parsing
- Structured task review/edit before saving
- Weekly auto-scheduling
- Weekly calendar UI
- Drag/drop and resize editing for scheduled blocks
- PostgreSQL persistence for users, tasks, and time blocks
- Google Calendar read integration for busy-time awareness
- Google Calendar write-back for approved schedule blocks

### Not In MVP
- Team/shared calendars
- Mobile app
- Notifications
- Habit learning/personalization
- Advanced optimization scheduling
- Multi-user collaboration
- Voice input
- Offline mode

## 3. Core User Flow
1. User signs in with Google.
2. Frontend gets a Firebase ID token.
3. Backend validates the Firebase token and creates/fetches the user.
4. User lands on the planner dashboard.
5. User enters a messy natural-language plan.
6. Backend sends the plan to OpenAI for task parsing.
7. Backend validates the AI response and converts it into structured tasks.
8. User reviews and edits tasks before saving.
9. User requests schedule generation.
10. Scheduler assigns tasks into weekly time blocks.
11. Frontend displays scheduled blocks in the weekly calendar UI.
12. User drags/resizes blocks if needed.
13. User chooses which blocks to sync.
14. Backend writes approved blocks to Google Calendar.
15. Tasks, time blocks, sync status, and scheduler metadata are persisted in PostgreSQL.

## 4. Main Screens
- Login Page
- Goal Input Page
- Weekly Planner Page
- Task List / Sync Status Page

## 5. Locked Tech Stack

### Frontend
- React
- React Router
- FullCalendar
- Fetch API or Axios
- Firebase Auth

### Backend
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- Firebase Admin SDK
- OpenAI API
- Google Calendar API
- JWT / Firebase ID token validation

### Infra / Deployment
- AWS RDS for PostgreSQL
- Render or Railway for backend deployment
- Vercel for frontend deployment

### Observability
- Start with structured logging
- Add PostHog or Logtail later if needed

## 6. Day 14 Success Definition
A signed-in user can enter a messy weekly plan, convert it into structured tasks, review/edit those tasks, generate a weekly schedule, adjust it in a calendar UI, sync selected schedule blocks to Google Calendar, and have all core data persisted in PostgreSQL.

## 7. Engineering Principles
- Use AI only for parsing, not for critical scheduling decisions.
- Validate all AI output against a strict schema.
- Let users confirm parsed tasks before scheduling.
- Keep scheduling deterministic and explainable.
- Make Google Calendar sync idempotent.
- Persist enough metadata for debugging, auditability, and interview storytelling.

## 8. Resume / Interview Framing
This project should demonstrate:
- secure Google authentication
- full-stack system design
- LLM guardrails and schema validation
- deterministic scheduling logic
- real third-party API integration
- production-style persistence, sync reliability, and observability
