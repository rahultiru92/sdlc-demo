# AGENTS.md — Store Brain Demo

## Root — Repo conventions
- Kotlin for all backend services. Spring Boot 3.x patterns.
- React + TypeScript for frontend. Functional components only.
- Every feature branch follows: `feature/<ticket-id>-<short-description>`
- Never commit directly to main. All changes via PR.
- PR description must include: what changed, why, test coverage.

## Domain — Alert Rules
- An alert rule has: id, name, type, severity (LOW/MEDIUM/HIGH), conditions, isActive
- AlertRuleService owns all business logic. Controllers are thin.
- New rule types must be added to the AlertRuleType enum before use.
- All rule mutations are logged to the audit trail.

## Module — Backend API
- REST endpoints live in AlertRuleController.kt
- Follow existing endpoint naming: GET /api/v1/alert-rules, POST /api/v1/alert-rules
- Input validation happens at the controller layer via @Valid annotations
- Return standardized ApiResponse<T> wrapper for all responses
