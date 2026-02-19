# Contributing to CT B2C Storefront

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Project Structure](#project-structure)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](.github/CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## Getting Started

### Prerequisites

- **Docker Desktop** (running)
- **Node.js 20+**
- **npm 10+**
- **commercetools account** with project key and API credentials

### Local Setup

```bash
# 1. Fork and clone
git clone https://github.com/<your-username>/ct-b2c-storefront.git
cd ct-b2c-storefront

# 2. Install dependencies
npm install

# 3. Configure environment
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local
# Fill in your CT credentials in apps/api/.env.local

# 4. Start local dev stack
docker compose up --build

# 5. Visit http://localhost:3000
```

### Useful Commands

```bash
npm run dev              # Start all services in dev mode
npm run build            # Build all packages
npm run test             # Run all tests
npm run lint             # Lint all packages
npm run typecheck        # TypeScript check all packages
npx turbo test --filter=api    # Test only API
npx turbo test --filter=web    # Test only Web
```

## Development Workflow

This project follows **GitFlow**:

```
main            ← production (tagged releases)
  └─ hotfix/*   ← emergency fixes

develop         ← integration branch
  └─ feature/*  ← new features
  └─ bugfix/*   ← bug fixes

release/*       ← stabilisation before release
```

### Creating a Feature

```bash
# 1. Branch from develop
git checkout develop && git pull origin develop
git checkout -b feature/short-description

# 2. Make your changes with atomic commits
git commit -m "feat(api/products): add search endpoint"
git commit -m "test(api/products): add unit tests for search"

# 3. Push and create a PR → develop
git push origin feature/short-description
```

### Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/description` | `feature/product-search` |
| Bug fix | `bugfix/description` | `bugfix/cart-quantity` |
| Hotfix | `hotfix/v1.0.1-description` | `hotfix/v1.0.1-checkout-crash` |
| Release | `release/v1.0.0` | `release/v1.0.0` |
| Chore | `chore/description` | `chore/update-deps` |

## Coding Standards

### TypeScript

- **Strict mode** is enabled in all packages
- Use explicit types for function parameters and return types
- Avoid `any` — use `unknown` when type is uncertain
- Use interfaces for object shapes, types for unions/intersections

### Architecture Rules

1. **CT SDK lives exclusively in the NestJS backend** (`apps/api`). The frontend never imports or calls commercetools directly.
2. **Frontend calls NestJS via server-side fetch** in Server Components. No CT credentials or SDK code in the browser.
3. **Shared types** go in `packages/types`. Don't duplicate types across apps.
4. **Shared config** goes in `packages/config`.

### File Organization

```
apps/api/src/
├── <module>/
│   ├── <module>.controller.ts     # HTTP endpoints
│   ├── <module>.service.ts        # Business logic
│   ├── <module>.service.spec.ts   # Service tests
│   ├── <module>.module.ts         # NestJS module
│   └── index.ts                   # Barrel export

apps/web/src/
├── app/(store)/                   # App Router pages
├── components/                    # React components
│   ├── Component.tsx
│   └── Component.test.tsx         # Component tests
├── contexts/                      # React contexts
├── lib/                           # Utilities
└── types/                         # Frontend-specific types
```

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code refactoring (no functional change) |
| `test` | Adding/updating tests |
| `docs` | Documentation |
| `chore` | Build, CI, tooling |
| `perf` | Performance improvement |
| `ci` | CI/CD changes |

### Scopes

Prefix with the package: `api/module`, `web/component`, `packages/types`, etc.

```bash
feat(api/cart): add discount code support
fix(web/checkout): resolve shipping method selection crash
test(api/auth): add unit tests for password reset
docs(readme): update local dev instructions
ci(pipeline): add CodeQL security scanning
```

## Pull Request Process

1. **Create a PR** from your feature branch to `develop`
2. **Fill out the PR template** completely
3. **Ensure CI passes** — lint, typecheck, tests, build
4. **Request review** from a maintainer
5. **Address feedback** with follow-up commits
6. **Squash and merge** once approved

### PR Requirements

- [ ] All CI checks pass
- [ ] Unit tests added for new functionality
- [ ] No secrets or credentials committed
- [ ] Self-reviewed the diff
- [ ] Follows coding standards

## Testing Requirements

**All new features must include unit tests.** No exceptions.

### API (NestJS)

- **Test runner**: Jest
- **Location**: `*.spec.ts` next to source files
- **Mock**: CT SDK responses, Redis operations
- **Minimum**: Test happy path + error cases

### Web (Next.js)

- **Test runner**: Vitest + Testing Library
- **Location**: `*.test.tsx` next to components
- **Mock**: API responses, contexts
- **Minimum**: Test rendering + user interactions

### Running Tests

```bash
# All tests
npm run test

# Specific package
npx turbo test --filter=api
npx turbo test --filter=web

# Watch mode
npm run test:watch --workspace=apps/api
```

## Project Structure

```
ct-b2c-storefront/
├── apps/
│   ├── api/             # NestJS backend (port 8080)
│   └── web/             # Next.js frontend (port 3000)
├── packages/
│   ├── types/           # Shared TypeScript types
│   ├── config/          # Shared configuration (env, constants)
│   └── eslint-config/   # Shared ESLint rules
├── scripts/
│   └── seed.js          # CT sample data seeder
├── .github/
│   ├── workflows/       # CI/CD pipelines
│   ├── ISSUE_TEMPLATE/  # Issue templates
│   └── SECURITY.md      # Security policy
├── docker-compose.yml   # Local dev stack
├── turbo.json           # Turborepo config
└── package.json         # Root workspace config
```

## Questions?

Open a [Discussion](https://github.com/JefinFrancis/ct-b2c-storefront/discussions) for questions or ideas.
