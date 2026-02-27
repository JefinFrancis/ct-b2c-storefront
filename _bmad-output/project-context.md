---
project_name: "ct-b2c-storefront"
user_name: "Jefin"
date: "2026-02-25"
sections_completed: ["technology_stack"]
existing_patterns_found: 15
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- Monorepo: Turborepo + npm workspaces (`turbo` ^2.5.0)
- Runtime: Node.js >=20.0.0 (npm 10.9.0)
- Language: TypeScript (strict) ^5.7.3
- Backend: NestJS ^10.4 (API on port 8080)
- Frontend: Next.js App Router ^15.1 (web on port 3000; 3001 via Docker)
- UI: React 19 ^19.0 + Tailwind CSS ^3.4
- Commerce: commercetools Platform SDK ^8.24 + SDK client v2 ^2.5
- Auth: Passport JWT (@nestjs/passport) ^10.0 + @nestjs/jwt ^10.2
- Cache: Redis 7 (local) / Upstash (prod) with `ioredis` ^5.4
- Validation: `class-validator` ^0.14 + `zod` ^3.24
- API Tests: Jest ^29.7 + @nestjs/testing
- Web Tests: Vitest ^3.2 + @testing-library/react ^16.3
- Formatting: Prettier ^3.5
- Container: Docker + docker-compose (node:20 base)

## Critical Implementation Rules

_Documented after discovery phase_
