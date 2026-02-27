# Documentation Index — CT B2C Storefront

> Complete documentation suite for the ct-b2c-storefront project.

---

## 📚 Master Documentation Guide

Welcome! This is your starting point for understanding and working with the CT B2C Storefront. Below is the complete documentation suite organized by use case.

---

## 🚀 Getting Started (5-10 min)

**New to the project?** Start here:

1. Read: [project-context.md](project-context.md) — 5-minute overview
2. Read: [Quick Reference — Getting Started](QUICK_REFERENCE.md#getting-started) — First-time setup
3. Run: `docker compose up --build`
4. Visit: http://localhost:3001

**Then explore:**
- [FEATURES_GUIDE.md](FEATURES_GUIDE.md) — What the storefront does
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) — How the API works
- [COMPONENTS_REFERENCE.md](COMPONENTS_REFERENCE.md) — Frontend components

---

## 📖 Documentation by Role

### For Frontend Developers

1. **Learn the basics:**
   - [FEATURES_GUIDE.md](FEATURES_GUIDE.md) — Feature overview
   - [COMPONENTS_REFERENCE.md](COMPONENTS_REFERENCE.md) — Component API and usage
   - [ARCHITECTURE_GUIDE.md](ARCHITECTURE_GUIDE.md#2-react-contexts-for-client-state) — React Context patterns

2. **Build features:**
   - [QUICK_REFERENCE.md#adding-a-new-feature](QUICK_REFERENCE.md#adding-a-new-feature) — Feature development workflow
   - [COMPONENTS_REFERENCE.md](COMPONENTS_REFERENCE.md) — Look up component props and usage
   - [API_DOCUMENTATION.md](API_DOCUMENTATION.md) — Check API endpoint contracts

3. **Test components:**
   - [TESTING_GUIDE.md#web-testing-vitest--react-testing-library](TESTING_GUIDE.md#web-testing-vitest--react-testing-library) — Testing patterns
   - [TESTING_GUIDE.md#mocking-hooks--contexts](TESTING_GUIDE.md#mocking-hooks--contexts) — Mocking strategies

4. **Deploy to production:**
   - [DEPLOYMENT_GUIDE.md#step-5-deploy-web-service](DEPLOYMENT_GUIDE.md#step-5-deploy-web-service) — Next.js Cloud Run deployment

---

### For Backend Developers

1. **Learn the basics:**
   - [project-context.md](project-context.md) — Tech stack and conventions
   - [ARCHITECTURE_GUIDE.md](ARCHITECTURE_GUIDE.md) — System design and principles
   - [API_DOCUMENTATION.md](API_DOCUMENTATION.md) — API endpoints (your contract)

2. **Build features:**
   - [QUICK_REFERENCE.md#adding-a-new-feature](QUICK_REFERENCE.md#adding-a-new-feature) — Feature development workflow
   - [ARCHITECTURE_GUIDE.md#1-dependency-injection-nestjs](ARCHITECTURE_GUIDE.md#1-dependency-injection-nestjs) — NestJS patterns
   - [ARCHITECTURE_GUIDE.md#3-cache-aside-pattern-redis](ARCHITECTURE_GUIDE.md#3-cache-aside-pattern-redis) — Caching patterns

3. **Test services:**
   - [TESTING_GUIDE.md#api-testing-jest--nestjs](TESTING_GUIDE.md#api-testing-jest--nestjs) — API testing guide
   - [TESTING_GUIDE.md#test-fixtures](TESTING_GUIDE.md#test-fixtures) — Mock data shapes

4. **Deploy to production:**
   - [DEPLOYMENT_GUIDE.md#step-4-deploy-api-service](DEPLOYMENT_GUIDE.md#step-4-deploy-api-service) — NestJS Cloud Run deployment

---

### For DevOps / Infrastructure

1. **Local development:**
   - [DEPLOYMENT_GUIDE.md#local-development](DEPLOYMENT_GUIDE.md#local-development) — Docker Compose setup

2. **Production deployment:**
   - [DEPLOYMENT_GUIDE.md#gcp-deployment](DEPLOYMENT_GUIDE.md#gcp-deployment) — Complete GCP setup (20-30 min)
   - [DEPLOYMENT_GUIDE.md#step-1-set-up-gcp-project](DEPLOYMENT_GUIDE.md#step-1-set-up-gcp-project) — GCP project initialization
   - [DEPLOYMENT_GUIDE.md#step-6-set-up-cloud-cdn](DEPLOYMENT_GUIDE.md#step-6-set-up-cloud-cdn) — CDN configuration

3. **CI/CD:**
   - [DEPLOYMENT_GUIDE.md#step-7-github-actions-cicd](DEPLOYMENT_GUIDE.md#step-7-github-actions-cicd) — GitHub Actions setup

4. **Troubleshooting:**
   - [DEPLOYMENT_GUIDE.md#troubleshooting](DEPLOYMENT_GUIDE.md#troubleshooting) — Common deployment issues
   - [QUICK_REFERENCE.md#troubleshooting](QUICK_REFERENCE.md#troubleshooting) — General troubleshooting

---

### For QA / Testing

1. **Feature verification:**
   - [FEATURES_GUIDE.md](FEATURES_GUIDE.md) — What features exist and how they work

2. **Test coverage:**
   - [TESTING_GUIDE.md](TESTING_GUIDE.md) — Testing strategy and test organization
   - [TESTING_GUIDE.md#coverage](TESTING_GUIDE.md#coverage) — How to run coverage reports

3. **Manual testing:**
   - [QUICK_REFERENCE.md](QUICK_REFERENCE.md) — Common workflows and scenarios

---

### For Product Managers

1. **Understand features:**
   - [FEATURES_GUIDE.md](FEATURES_GUIDE.md) — All 7+ features with user flows
   - [ARCHITECTURE_GUIDE.md#system-architecture](ARCHITECTURE_GUIDE.md#system-architecture) — How the system works

2. **Project status:**
   - [.github/copilot-instructions.md](.github/copilot-instructions.md) — Project status and next priorities

---

## 📋 Documentation by Topic

### Architecture & Design

- [ARCHITECTURE_GUIDE.md](ARCHITECTURE_GUIDE.md) — **Start here for system design**
  - System architecture diagram
  - Monorepo structure
  - Core patterns (DI, Contexts, cache-aside, sessions)
  - Data flow diagrams
  - Authentication & authorization
  - Security considerations

### API Development

- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) — **Complete API reference**
  - All endpoints with request/response schemas
  - Auth flow
  - Module architecture
  - Environment variables
  - Error handling
  - Caching strategy

### Frontend Development

- [COMPONENTS_REFERENCE.md](COMPONENTS_REFERENCE.md) — **Component API & usage**
  - All React components with props
  - Layout components (Header, Footer, etc.)
  - Product components (ProductCard, ImageGallery, etc.)
  - Cart & checkout components
  - Auth components
  - Patterns: useAsync hook, formatPrice, api-client

- [FEATURES_GUIDE.md](FEATURES_GUIDE.md) — **Feature descriptions**
  - Feature 1: Products & PLP
  - Feature 2: Product Detail Page
  - Feature 3: Shopping Cart
  - Feature 4: Authentication
  - Feature 5: Multi-Step Checkout
  - Feature 6: Order History
  - Feature 7: Category Pages & Homepage
  - Additional features (Wishlist, Discounts, etc.)

### Testing

- [TESTING_GUIDE.md](TESTING_GUIDE.md) — **Testing strategies & examples**
  - API testing (Jest + NestJS)
  - Web testing (Vitest + React Testing Library)
  - Mocking patterns
  - User interaction tests
  - Form testing
  - Coverage reporting

### Deployment & DevOps

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) — **Deployment to staging and production**
  - Local development with Docker Compose
  - GCP setup (Artifact Registry, Cloud Run, Secret Manager)
  - GitHub Actions CI/CD
  - Environment variables per environment
  - Troubleshooting deployment issues

### Quick Reference

- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) — **Common tasks & FAQ**
  - First-time setup
  - Development workflows (new feature, bugfix, refactoring)
  - Common tasks (update credentials, seed data, view logs, reset environment)
  - Troubleshooting
  - FAQ (30+ common questions)
  - Command cheat sheet

---

## 🗂️ File Organization

```
docs/
├── README.md                          # Main project README (getting started)
├── project-context.md                 # LLM-optimized tech context
│
├── API_DOCUMENTATION.md               # complete API reference
├── COMPONENTS_REFERENCE.md            # React component API
├── FEATURES_GUIDE.md                  # All 7+ features explained
├── ARCHITECTURE_GUIDE.md              # System design & patterns
├── TESTING_GUIDE.md                   # Testing guide
├── DEPLOYMENT_GUIDE.md                # Local & GCP deployment
├── QUICK_REFERENCE.md                 # Common tasks & FAQ
└── DOCUMENTATION_INDEX.md             # This file
```

---

## 🔍 How to Find What You're Looking For

### "How do I...?"

| Question | Where to Look |
|---|---|
| ...get started? | [QUICK_REFERENCE.md#getting-started](QUICK_REFERENCE.md#getting-started) |
| ...add a new feature? | [QUICK_REFERENCE.md#adding-a-new-feature](QUICK_REFERENCE.md#adding-a-new-feature) |
| ...fix a bug? | [QUICK_REFERENCE.md#fixing-a-bug](QUICK_REFERENCE.md#fixing-a-bug) |
| ...run tests? | [TESTING_GUIDE.md#quick-start](TESTING_GUIDE.md#quick-start) |
| ...deploy to production? | [DEPLOYMENT_GUIDE.md#gcp-deployment](DEPLOYMENT_GUIDE.md#gcp-deployment) |
| ...find an API endpoint? | [API_DOCUMENTATION.md](API_DOCUMENTATION.md) |
| ...use a React component? | [COMPONENTS_REFERENCE.md](COMPONENTS_REFERENCE.md) |
| ...understand the architecture? | [ARCHITECTURE_GUIDE.md](ARCHITECTURE_GUIDE.md) |
| ...troubleshoot an issue? | [QUICK_REFERENCE.md#troubleshooting](QUICK_REFERENCE.md#troubleshooting) or [DEPLOYMENT_GUIDE.md#troubleshooting](DEPLOYMENT_GUIDE.md#troubleshooting) |

### "I need to understand...?"

| Topic | Where to Look |
|---|---|
| Commerce flow (cart → checkout → order) | [FEATURES_GUIDE.md#feature-3-shopping-cart](FEATURES_GUIDE.md#feature-3-shopping-cart) → [FEATURES_GUIDE.md#feature-5-checkout-multi-step](FEATURES_GUIDE.md#feature-5-checkout-multi-step) |
| Authentication & authorization | [ARCHITECTURE_GUIDE.md#authentication--authorization](ARCHITECTURE_GUIDE.md#authentication--authorization) |
| Data caching strategy | [ARCHITECTURE_GUIDE.md#caching-strategy](ARCHITECTURE_GUIDE.md#caching-strategy) |
| API module architecture | [API_DOCUMENTATION.md#module-architecture](API_DOCUMENTATION.md#module-architecture) |
| Frontend component structure | [COMPONENTS_REFERENCE.md](COMPONENTS_REFERENCE.md) |
| Testing strategy | [TESTING_GUIDE.md#overview](TESTING_GUIDE.md#overview) |
| Deployment architecture | [DEPLOYMENT_GUIDE.md#architecture](DEPLOYMENT_GUIDE.md#architecture) |
| System security | [ARCHITECTURE_GUIDE.md#security-considerations](ARCHITECTURE_GUIDE.md#security-considerations) |

---

## 🔗 Cross-References

### Related Documentation

- [AGENT_CONTEXT.md](../AGENT_CONTEXT.md) — Project status, completed work, pending work, known issues
- [CT_AGENT_PROMPT.md](../CT_AGENT_PROMPT.md) — Original project specification (detailed)

---

## 📝 Contributing to Documentation

### When You Make Changes

1. **Update AGENT_CONTEXT.md** — What changed and why
2. **Update relevant doc file** — If feature/API changes
3. **Update QUICK_REFERENCE.md** — If workflow or command changes
4. **Commit with message:** `docs: update API endpoints for new [feature]`

### Style Guide

- Use **Markdown** for all documentation
- Use **code blocks** for examples (specify language: `typescript`, `bash`, etc.)
- Use **tables** for comparisons and references
- Use **numbered lists** for step-by-step instructions
- Use **description list** (`**Term:**`) for definitions
- Include **real examples** from the codebase
- Keep paragraphs short and scannable

---

## 🆘 Still Need Help?

1. **Check Quick Reference FAQ** — [QUICK_REFERENCE.md#faq](QUICK_REFERENCE.md#faq)
2. **Search for keyword** — Use Ctrl+F to search across docs
3. **Check current branch** — Look at recent commits and PRs
4. **Ask in team chat** — Share the relevant doc link
5. **Update AGENT_CONTEXT.md** — Add known issue if not documented

---

## 📚 External Resources

- [Next.js 15 Docs](https://nextjs.org/docs)
- [NestJS Docs](https://docs.nestjs.com/)
- [commercetools Platform Docs](https://docs.commercetools.com/)
- [React 19 Docs](https://react.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [GCP Cloud Run Docs](https://cloud.google.com/run/docs)

---

## 📄 License

This documentation is part of the ct-b2c-storefront project.

---

**Last Updated:** 2026-02-25  
**Contributors:** Jefin Francis  
**Documentation Suite Version:** 1.0.0

