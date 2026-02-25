# Deployment Guide — CT B2C Storefront

> Complete guide to deploying the storefront locally and to production (GCP).

---

## Table of Contents

1. [Local Development (docker-compose)](#local-development)
2. [Local Manual Setup](#local-manual-setup)
3. [GCP Deployment (Cloud Run)](#gcp-deployment)
4. [Environment Variables](#environment-variables)
5. [Troubleshooting](#troubleshooting)

---

## Local Development

### Prerequisites

- Docker Desktop (v4.0+)
- Docker Compose (v2.0+)
- Node.js 20 (for IDE/linting, not required if using containers)
- Git

### Quick Start

**First Time Setup:**
```bash
# Clone repo
git clone https://github.com/JefinFrancis/ct-b2c-storefront.git
cd ct-b2c-storefront

# Create .env files from examples
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local

# Edit these files with your CT credentials
# → apps/api/.env.local
# → apps/web/.env.local

# Start all services
docker compose up --build
```

**Daily Use:**
```bash
# Start services (reuses built images)
docker compose up

# Stop all services
docker compose down

# Stop and clear Redis data
docker compose down -v
```

### Environment Files

#### `apps/api/.env.local`
```bash
# commercetools
CTP_PROJECT_KEY=c-spire-oe-demo
CTP_CLIENT_ID=your-client-id-here
CTP_CLIENT_SECRET=your-client-secret-here
CTP_AUTH_URL=https://auth.us-central1.gcp.commercetools.com
CTP_API_URL=https://api.us-central1.gcp.commercetools.com
CTP_SCOPES=manage_products manage_orders manage_customers manage_carts manage_payments view_published_products

# Redis (local container)
REDIS_URL=redis://redis:6379

# Server
PORT=8080
ALLOWED_ORIGIN=http://localhost:3000
```

#### `apps/web/.env.local`
```bash
# API URLs
NEXT_PUBLIC_API_URL=http://localhost:8080
INTERNAL_API_URL=http://api:8080

# Redis (optional, only if using server-side caching in web)
REDIS_URL=redis://redis:6379

# Frontend
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### Service URLs

Once `docker compose up` completes, access:

| Service | URL |
|---|---|
| **Frontend (Next.js)** | http://localhost:3001 |
| **API (NestJS)** | http://localhost:8080 |
| **Redis** | localhost:6380 |
| **API Health** | http://localhost:8080/health |

### Docker Compose Services

```yaml
services:
  web:
    image: node:20
    ports: ["3001:3000"]
    env_file: apps/web/.env.local
    volumes: [./apps/web:/app]
    command: npm run dev

  api:
    image: node:20
    ports: ["8080:8080"]
    env_file: apps/api/.env.local
    volumes: [./apps/api:/app]
    command: npm run start:dev
    depends_on: [redis]

  redis:
    image: redis:7-alpine
    ports: ["6380:6379"]
```

### Useful Commands

```bash
# View logs from all services
docker compose logs -f

# View logs from specific service
docker compose logs -f api
docker compose logs -f web

# Rebuild images (after dependency changes)
docker compose up --build

# Stop all services without removing volumes
docker compose down

# Remove all data including Redis
docker compose down -v

# Run commands in container
docker compose exec api npm test
docker compose exec web npm test
```

---

## Local Manual Setup

If not using Docker, you can run services locally:

### Prerequisites
- Node.js 20.0+
- Redis 7.0+ (installed locally or via `brew install redis`)
- npm 10.0+

### Setup

```bash
# Install dependencies
npm install

# Start Redis independently
redis-server  # or `brew services start redis` on macOS

# In one terminal: Start API
cd apps/api
npm run start:dev
# API listens on http://localhost:8080

# In another terminal: Start Web
cd apps/web
npm run dev
# Web listens on http://localhost:3000

# In another terminal: Run tests
npm run test
```

### Environment Variables (Manual)

Set in shell before running services:
```bash
export CTP_PROJECT_KEY=c-spire-oe-demo
export CTP_CLIENT_ID=...
export CTP_CLIENT_SECRET=...
export CTP_AUTH_URL=https://auth.us-central1.gcp.commercetools.com
export CTP_API_URL=https://api.us-central1.gcp.commercetools.com
export CTP_SCOPES="manage_products manage_orders manage_customers manage_carts"
export REDIS_URL=redis://localhost:6379
export NEXT_PUBLIC_API_URL=http://localhost:8080
export INTERNAL_API_URL=http://localhost:8080
```

Or create `.env.local` files as shown above.

---

## GCP Deployment

### Prerequisites

- GCP account with billing enabled
- gcloud CLI installed and authenticated
- Artifact Registry API enabled
- Cloud Run API enabled
- Secret Manager API enabled

### Architecture

```
GitHub (main branch)
  │ Push event or manual trigger
  └─► GitHub Actions CI/CD
      ├─► Build Docker images
      ├─► Tag: {region}-docker.pkg.dev/{project}/{repo}/api:sha
      ├─► Tag: {region}-docker.pkg.dev/{project}/{repo}/web:latest
      │
      ├─► Push to Artifact Registry
      │
      ├─► Deploy to Cloud Run (staging)
      │   └─► web:  --ingress=all   (public, behind Cloud CDN)
      │   └─► api:  --ingress=internal (only web can call)
      │
      └─► Deploy to Cloud Run (prod)
          └─► web:  --ingress=all
          └─► api:  --ingress=internal
```

### Step 1: Set Up GCP Project

```bash
# Set project ID
export GCP_PROJECT_ID=ct-b2c-storefront-prod
export GCP_REGION=us-central1
export ARTIFACT_REGISTRY_REPO=ct-b2c-storefront

# Create GCP project (if new)
gcloud projects create $GCP_PROJECT_ID

# Set as default
gcloud config set project $GCP_PROJECT_ID

# Enable required APIs
gcloud services enable artifactregistry.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### Step 2: Set Up Artifact Registry

```bash
# Create Docker repository
gcloud artifacts repositories create $ARTIFACT_REGISTRY_REPO \
  --repository-format=docker \
  --location=$GCP_REGION \
  --description="CT B2C Storefront Docker images"

# Configure Docker authentication
gcloud auth configure-docker $GCP_REGION-docker.pkg.dev

# Verify
gcloud artifacts repositories list
```

### Step 3: Store Secrets in Secret Manager

```bash
# Store CT credentials
echo -n "c-spire-oe-demo" | gcloud secrets create CT_PROJECT_KEY --data-file=-
echo -n "your-client-id" | gcloud secrets create CT_CLIENT_ID --data-file=-
echo -n "your-client-secret" | gcloud secrets create CT_CLIENT_SECRET --data-file=-
echo -n "https://auth.us-central1.gcp.commercetools.com" | gcloud secrets create CT_AUTH_URL --data-file=-
echo -n "https://api.us-central1.gcp.commercetools.com" | gcloud secrets create CT_API_URL --data-file=-
echo -n "manage_products manage_orders manage_customers manage_carts manage_payments view_published_products" | gcloud secrets create CT_SCOPES --data-file=-

# Store Redis URL (Upstash connection string)
echo -n "redis://default:password@host:port" | gcloud secrets create UPSTASH_REDIS_URL --data-file=-

# List secrets
gcloud secrets list
```

### Step 4: Deploy API Service

```bash
# Build and push image
gcloud builds submit \
  --tag $GCP_REGION-docker.pkg.dev/$GCP_PROJECT_ID/$ARTIFACT_REGISTRY_REPO/api:latest \
  --source=. \
  --remote

# Deploy to Cloud Run (internal only)
gcloud run deploy api \
  --image=$GCP_REGION-docker.pkg.dev/$GCP_PROJECT_ID/$ARTIFACT_REGISTRY_REPO/api:latest \
  --platform=managed \
  --region=$GCP_REGION \
  --memory=1Gi \
  --cpu=1 \
  --timeout=300 \
  --ingress=internal \
  --set-env-vars=PORT=8080 \
  --set-secrets=CTP_PROJECT_KEY=CT_PROJECT_KEY:latest \
  --set-secrets=CTP_CLIENT_ID=CT_CLIENT_ID:latest \
  --set-secrets=CTP_CLIENT_SECRET=CT_CLIENT_SECRET:latest \
  --set-secrets=CTP_AUTH_URL=CT_AUTH_URL:latest \
  --set-secrets=CTP_API_URL=CT_API_URL:latest \
  --set-secrets=CTP_SCOPES=CT_SCOPES:latest \
  --set-secrets=REDIS_URL=UPSTASH_REDIS_URL:latest \
  --allow-unauthenticated=false
```

### Step 5: Deploy Web Service

```bash
# Build and push image
gcloud builds submit \
  --tag=$GCP_REGION-docker.pkg.dev/$GCP_PROJECT_ID/$ARTIFACT_REGISTRY_REPO/web:latest \
  --source=. \
  --remote

# Deploy to Cloud Run (public, behind CDN)
gcloud run deploy web \
  --image=$GCP_REGION-docker.pkg.dev/$GCP_PROJECT_ID/$ARTIFACT_REGISTRY_REPO/web:latest \
  --platform=managed \
  --region=$GCP_REGION \
  --memory=512Mi \
  --cpu=1 \
  --timeout=300 \
  --ingress=all \
  --set-env-vars=NEXT_PUBLIC_API_URL=https://api.example.com \
  --set-env-vars=INTERNAL_API_URL=https://api.region-docker.pkg.dev/{project}/... \
  --allow-unauthenticated=true
```

### Step 6: Set Up Cloud CDN

```bash
# Create backend service from Cloud Run web service
gcloud compute backend-services create ct-b2c-web-backend \
  --protocol=HTTPS \
  --global

# Add Cloud Run service
gcloud compute backend-services add-backends ct-b2c-web-backend \
  --instance-group=web-ig \
  --instance-group-zone=$GCP_REGION \
  --global

# Enable Cloud CDN
gcloud compute backend-services update ct-b2c-web-backend \
  --enable-cdn \
  --cache-mode=CACHE_ALL_STATIC \
  --global

# Create URL map
gcloud compute url-maps create ct-b2c-cdn-map \
  --default-service=ct-b2c-web-backend

# Create HTTPS proxy
gcloud compute target-https-proxies create ct-b2c-cdn-proxy \
  --url-map=ct-b2c-cdn-map \
  --ssl-certificates=ct-b2c-cert

# Create forwarding rule
gcloud compute forwarding-rules create ct-b2c-cdn-rule \
  --global \
  --target-https-proxy=ct-b2c-cdn-proxy \
  --address=ct-b2c-ip \
  --ports=443
```

### Step 7: GitHub Actions CI/CD

Create `.github/workflows/deploy.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [develop, main]

env:
  GCP_PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  GCP_REGION: us-central1
  ARTIFACT_REGISTRY_REPO: ct-b2c-storefront

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npx turbo typecheck

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      - uses: google-github-actions/setup-gcloud@v2

      - name: Build and push API image
        run: |
          gcloud builds submit \
            --tag=$GCP_REGION-docker.pkg.dev/$GCP_PROJECT_ID/$ARTIFACT_REGISTRY_REPO/api:$GITHUB_SHA \
            --source=. \
            --dockerfile=apps/api/Dockerfile

      - name: Build and push Web image
        run: |
          gcloud builds submit \
            --tag=$GCP_REGION-docker.pkg.dev/$GCP_PROJECT_ID/$ARTIFACT_REGISTRY_REPO/web:$GITHUB_SHA \
            --source=. \
            --dockerfile=apps/web/Dockerfile

  deploy-staging:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      - uses: google-github-actions/setup-gcloud@v2

      - name: Deploy API to staging
        run: |
          gcloud run deploy api-staging \
            --image=$GCP_REGION-docker.pkg.dev/$GCP_PROJECT_ID/$ARTIFACT_REGISTRY_REPO/api:$GITHUB_SHA \
            --region=$GCP_REGION \
            --ingress=internal

      - name: Deploy Web to staging
        run: |
          gcloud run deploy web-staging \
            --image=$GCP_REGION-docker.pkg.dev/$GCP_PROJECT_ID/$ARTIFACT_REGISTRY_REPO/web:$GITHUB_SHA \
            --region=$GCP_REGION \
            --ingress=all

  deploy-prod:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      - uses: google-github-actions/setup-gcloud@v2

      - name: Deploy API to prod
        run: |
          gcloud run deploy api \
            --image=$GCP_REGION-docker.pkg.dev/$GCP_PROJECT_ID/$ARTIFACT_REGISTRY_REPO/api:$GITHUB_SHA \
            --region=$GCP_REGION \
            --ingress=internal

      - name: Deploy Web to prod
        run: |
          gcloud run deploy web \
            --image=$GCP_REGION-docker.pkg.dev/$GCP_PROJECT_ID/$ARTIFACT_REGISTRY_REPO/web:$GITHUB_SHA \
            --region=$GCP_REGION \
            --ingress=all
```

### Environment Variables in Cloud Run

API Service:
```
CTP_PROJECT_KEY = (from Secret Manager)
CTP_CLIENT_ID = (from Secret Manager)
CTP_CLIENT_SECRET = (from Secret Manager)
CTP_AUTH_URL = (from Secret Manager)
CTP_API_URL = (from Secret Manager)
CTP_SCOPES = (from Secret Manager)
REDIS_URL = (Upstash connection string)
PORT = 8080
ALLOWED_ORIGIN = https://ct-b2c-web.example.com
```

Web Service:
```
NEXT_PUBLIC_API_URL = https://api.example.com
INTERNAL_API_URL = https://api-service-url.run.app
NEXT_PUBLIC_APP_URL = https://ct-b2c-web.example.com
```

---

## Environment Variables

### API Service (`apps/api`)

| Variable | Purpose | Example |
|---|---|---|
| `CTP_PROJECT_KEY` | commercetools project key | `c-spire-oe-demo` |
| `CTP_CLIENT_ID` | CT API client ID | `abc123...` |
| `CTP_CLIENT_SECRET` | CT API client secret | `xyz789...` |
| `CTP_AUTH_URL` | CT authentication endpoint | `https://auth.us-central1.gcp.commercetools.com` |
| `CTP_API_URL` | CT API endpoint | `https://api.us-central1.gcp.commercetools.com` |
| `CTP_SCOPES` | Comma-separated scopes | `manage_products manage_orders manage_customers` |
| `REDIS_URL` | Redis connection string | `redis://redis:6379` or `redis://...upstash...` |
| `PORT` | Server port | `8080` |
| `ALLOWED_ORIGIN` | CORS allowed origin | `http://localhost:3000` or `https://example.com` |
| `NODE_ENV` | Environment | `development` or `production` |

### Web Service (`apps/web`)

| Variable | Purpose | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | API URL for browser | `http://localhost:8080` or `https://api.example.com` |
| `INTERNAL_API_URL` | API URL for server-side | `http://api:8080` (Docker) or Cloud Run URL |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | `http://localhost:3001` or `https://example.com` |
| `REDIS_URL` | Redis (optional) | `redis://redis:6379` or Upstash |
| `NODE_ENV` | Environment | `development` or `production` |

---

## Troubleshooting

### Docker Compose Issues

**"Port 3001 already in use"**
```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>

# Or change docker-compose port mapping
# Change `ports: ["3001:3000"]` to `ports: ["3002:3000"]`
```

**"Redis connection refused"**
```bash
# Ensure Redis container is running
docker compose ps

# Check Redis logs
docker compose logs redis

# Rebuild Redis container
docker compose down -v
docker compose up --build redis
```

**"Cannot find module 'commercetools'"**
```bash
# Reinstall dependencies
npm install

# Rebuild containers
docker compose up --build
```

### API Issues

**"401 Unauthorized from CT"**
- Check CT credentials in `.env.local`
- Verify API client has correct scopes
- Confirm CT_AUTH_URL and CT_API_URL are correct

**"CORS error: Cross-Origin Request Blocked"**
- Ensure `ALLOWED_ORIGIN` in `.env.local` matches frontend URL
- For Docker: `ALLOWED_ORIGIN=http://localhost:3000`
- For GCP: `ALLOWED_ORIGIN=https://web-service-url.run.app`

**"Redis cache not working"**
```bash
# Check Redis is accessible
npm run test:api -- redis.service.spec

# Check cache keys in Redis
docker compose exec redis redis-cli
> KEYS *
> GET products:list:*
```

### Web Issues

**"API unreachable from browser"**
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure API service is running and accessible
- For local dev, should be `http://localhost:8080`

**"Blank page or white screen"**
```bash
# Check browser console for errors (F12)
# Check Next.js server logs
docker compose logs web

# Rebuild Next.js
npm run build:web
```

**"Images not loading"**
- Check `remotePatterns` in `apps/web/next.config.ts`
- Ensure image domains are listed
- For local dev with placehold.co, it should be added

### GCP Deployment Issues

**"Cloud Run service never starts"**
```bash
# Check CloudBuild logs
gcloud builds log

# Check Cloud Run service logs
gcloud run services describe api --region=us-central1
# Look for error logs

# Tail logs
gcloud run services logs read api --region=us-central1 --limit=50
```

**"Secret Manager permission denied"**
```bash
# Add Cloud Run service account to Secret Manager IAM
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member=serviceAccount:ct-b2c-sa@$GCP_PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

**"NEXT_PUBLIC_API_URL incorrect in production"**
- Cloud Run URL is auto-generated: `https://api-xyz12345.run.app`
- For web service, set: `NEXT_PUBLIC_API_URL=https://api-xyz12345.run.app`
- Or use custom domain if configured

---

## Performance Optimization

### Redis Caching
- Products list: 5-min TTL
- Categories: 10-min TTL
- Shipping methods: 15-min TTL
- Customer data: 5-min TTL

### Cloud CDN (GCP)
- Caches static assets (images, CSS, JS)
- 1-hour default TTL for HTML
- Invalidate cache on deploy: `gcloud compute cdn-cache flush`

### Database Connections
- Connection pooling done by CT SDK
- NestJS handles request lifecycle

### Image Optimization
- Next.js Image component auto-optimizes
- WebP format for modern browsers
- Lazy loading by default

---

*Last updated: 2026-02-25*

