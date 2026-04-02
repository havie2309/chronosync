# Schema Plan

## Planned Tables
- users
- task_lists
- tasks
- time_blocks
- calendar_connections
- sync_logs
- prompt_versions
- scheduler_runs

## Key Relationships
- one user has many task_lists
- one task_list has many tasks
- one task can have many time_blocks
- one user can have one or more calendar_connections
- one scheduler_run can produce many time_blocks
- one time_block may map to one Google Calendar event

## Purpose
This schema is designed to support:
- normalization
- task persistence
- scheduling history
- calendar sync auditability
- prompt/version tracing
