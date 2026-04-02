# Architecture Overview

## High-Level Flow
1. User signs in with Google on the frontend.
2. Frontend receives Firebase ID token.
3. Backend validates token using Firebase Admin.
4. Backend creates or fetches the user record in PostgreSQL.
5. User submits natural-language goals.
6. Backend sends text to OpenAI for parsing.
7. Parsed tasks are validated and reviewed by the user.
8. Backend schedules tasks into time blocks.
9. Frontend displays the weekly calendar and task list.
10. Approved schedule blocks sync to Google Calendar.

## Main Systems
- React frontend for UI and calendar interactions
- Express backend for APIs, auth, parsing, scheduling, and sync
- PostgreSQL for persistence
- OpenAI API for task parsing
- Google Calendar API for calendar read/write
- Firebase Auth for Google login

## Design Rules
- LLMs parse intent, but do not control final scheduling logic.
- Scheduling should be deterministic and explainable.
- Calendar sync should be idempotent.
- Users must be able to review AI output before saving.
