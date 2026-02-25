<!-- BMAD:START -->
# BMAD Method — Project Instructions

## Project Configuration

- **Project**: ct-b2c-storefront
- **User**: Jefin
- **Communication Language**: English
- **Document Output Language**: English
- **User Skill Level**: intermediate
- **Output Folder**: {project-root}/_bmad-output
- **Planning Artifacts**: {project-root}/_bmad-output/planning-artifacts
- **Implementation Artifacts**: {project-root}/_bmad-output/implementation-artifacts
- **Project Knowledge**: {project-root}/docs

## BMAD Runtime Structure

- **Agent definitions**: `_bmad/bmm/agents/` (BMM module) and `_bmad/core/agents/` (core)
- **Workflow definitions**: `_bmad/bmm/workflows/` (organized by phase)
- **Core tasks**: `_bmad/core/tasks/` (help, editorial review, indexing, sharding, adversarial review)
- **Core workflows**: `_bmad/core/workflows/` (brainstorming, party-mode, advanced-elicitation)
- **Workflow engine**: `_bmad/core/tasks/workflow.xml` (executes YAML-based workflows)
- **Module configuration**: `_bmad/bmm/config.yaml`
- **Core configuration**: `_bmad/core/config.yaml`
- **Agent manifest**: `_bmad/_config/agent-manifest.csv`
- **Workflow manifest**: `_bmad/_config/workflow-manifest.csv`
- **Help manifest**: `_bmad/_config/bmad-help.csv`
- **Agent memory**: `_bmad/_memory/`

## Key Conventions

- Always load `_bmad/bmm/config.yaml` before any agent activation or workflow execution
- Store all config fields as session variables: `{user_name}`, `{communication_language}`, `{output_folder}`, `{planning_artifacts}`, `{implementation_artifacts}`, `{project_knowledge}`
- MD-based workflows execute directly — load and follow the `.md` file
- YAML-based workflows require the workflow engine — load `workflow.xml` first, then pass the `.yaml` config
- Follow step-based workflow execution: load steps JIT, never multiple at once
- Save outputs after EACH step when using the workflow engine
- The `{project-root}` variable resolves to the workspace root at runtime

## Available Agents

| Agent | Persona | Title | Capabilities |
|---|---|---|---|
| bmad-master | BMad Master | BMad Master Executor, Knowledge Custodian, and Workflow Orchestrator | runtime resource management, workflow orchestration, task execution, knowledge custodian |
| analyst | Mary | Business Analyst | market research, competitive analysis, requirements elicitation, domain expertise |
| architect | Winston | Architect | distributed systems, cloud infrastructure, API design, scalable patterns |
| dev | Amelia | Developer Agent | story execution, test-driven development, code implementation |
| pm | John | Product Manager | PRD creation, requirements discovery, stakeholder alignment, user interviews |
| qa | Quinn | QA Engineer | test automation, API testing, E2E testing, coverage analysis |
| quick-flow-solo-dev | Barry | Quick Flow Solo Dev | rapid spec creation, lean implementation, minimum ceremony |
| sm | Bob | Scrum Master | sprint planning, story preparation, agile ceremonies, backlog management |
| tech-writer | Paige | Technical Writer | documentation, Mermaid diagrams, standards compliance, concept explanation |
| ux-designer | Sally | UX Designer | user research, interaction design, UI patterns, experience strategy |

## Slash Commands

Type `/bmad-` in Copilot Chat to see all available BMAD workflows and agent activators. Agents are also available in the agents dropdown.
<!-- BMAD:END -->

---

# Project Instructions — ct-b2c-storefront

## Quick Summary

This is a **commercetools B2C storefront** built as a Turborepo monorepo with a **NestJS API** (`apps/api`, port 8080) and **Next.js 15 App Router frontend** (`apps/web`, port 3000). All 7 B2C features are complete with 151 passing tests. The project is ready for CI/CD and GCP deployment.

## Must-Read Files

Before writing any code, **always read these files first**:

1. **`AGENT_CONTEXT.md`** — Single source of truth for project state. Read first, code second. Update after every session.
2. **`docs/project-context.md`** — LLM-optimized technical context: architecture, patterns, conventions, environment variables.
3. **`CT_AGENT_PROMPT.md`** — Original project spec with detailed architecture, GitFlow strategy, testing requirements.

## Critical Rules

1. **CT SDK isolation** — The commercetools SDK is ONLY imported in `apps/api/src/commercetools/commercetools.service.ts`. Never import it in `apps/web`.
2. **API client** — All frontend HTTP calls go through `apps/web/src/lib/api-client.ts`. It handles server vs browser URL detection automatically. All paths use `/api/v1` prefix.
3. **Write tests** — Every new service/controller/component must have corresponding tests. API uses Jest, Web uses Vitest.
4. **Run tests** — `npm test` must pass before committing. Currently 151 tests (64 API + 87 Web).
5. **Update AGENT_CONTEXT.md** — After completing work, always update this file with what changed.
6. **Follow GitFlow** — Branch from `develop`, use `feature/CT-<id>-description` or `chore/description` naming.
7. **Conventional Commits** — `feat(api/cart): add endpoint`, `fix(web/auth): resolve redirect`, `test(api/orders): add service tests`.

## Architecture at a Glance

```
Next.js (web) ──HTTP──▶ NestJS (api) ──CT SDK──▶ commercetools API
                                      ──ioredis──▶ Redis
```

- **NestJS modules**: auth, cart, commercetools, customers, health, orders, payments, products, redis, wishlist
- **Next.js routes**: homepage, products (PLP/PDP), category pages, cart, checkout (multi-step), account (profile/orders/addresses/wishlist)
- **Contexts**: AuthContext (JWT + cookie), CartContext (session + merge), CheckoutContext (multi-step flow)
- **Shared packages**: `@ct-b2c/types` (Product, Cart, Order, Customer, etc.), `@ct-b2c/config`, `@ct-b2c/eslint-config`

## Key Patterns

| Pattern | Convention |
|---|---|
| NestJS service | Inject `CommercetoolsService` + `RedisService` via DI |
| Redis caching | Cache-aside: check cache → fetch CT → store cache (5-min products, 10-min categories) |
| Auth | JWT in localStorage + `auth-token` cookie; `JwtAuthGuard` on protected API routes; Next.js `middleware.ts` checks cookie |
| Cart sessions | `X-Session-Id` header (UUID v4); Redis maps session → cartId (30-day TTL) |
| Cart merge | On login/register, anonymous cart merges via CT `anonymousCartSignInMode: "MergeWithExistingCustomerCart"` |
| Theming | Tailwind `darkMode: 'class'`, CSS custom properties, ThemeToggle component, indigo brand palette |
| Server Components | Default for pages (data fetching); `"use client"` only for interactive components |
| Test co-location | `*.spec.ts` next to source (API/Jest), `*.test.tsx` next to source (Web/Vitest) |

## Development

```bash
docker compose up --build      # Start all services (first time)
docker compose up              # Daily use
npm test                       # Run all 151 tests
npx turbo typecheck            # TypeScript check
npx turbo build                # Build all packages
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3001 |
| API | http://localhost:8080 |
| Redis | localhost:6380 |

## Current Status & Next Steps

All 7 B2C features are complete (Products, PDP, Cart, Auth, Checkout, Orders, Category Pages + Homepage + UX Refresh). Comprehensive CT integration done (addresses, payments, wishlist, discount codes, cart merge, billing). 151 tests passing.

**Next priorities**: CI/CD pipeline → GCP deployment → Cloud CDN → Release v1.0.0
