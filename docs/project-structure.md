# Project Structure

## Root
- `apps/` contains the runnable applications
- `packages/` contains shared code
- `docs/` contains planning and architecture docs
- `infra/` contains database and deployment planning

## Applications
- `apps/frontend/` will contain the React client
- `apps/backend/` will contain the Express API server

## Shared Package
- `packages/shared/` will later contain:
  - shared TypeScript types
  - validation schemas
  - API contracts
  - constants used by both frontend and backend

## Infra
- `infra/db/` holds schema planning and migration strategy notes
- `infra/deploy/` holds deployment planning for frontend, backend, and database
