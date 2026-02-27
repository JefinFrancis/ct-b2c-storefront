# GCP Deployment Checklist — CT B2C Storefront

This guide walks you through deploying your ct-b2c-storefront to Google Cloud Platform step-by-step.

## 📋 Prerequisites

- [ ] GCP account with billing enabled
- [ ] gcloud CLI installed ([Install guide](https://cloud.google.com/sdk/docs/install))
- [ ] Docker Desktop running
- [ ] commercetools project credentials
- [ ] Redis instance (Upstash recommended for serverless)

## 🚀 Deployment Steps

### Step 1: Install & Configure gcloud CLI

```bash
# Install gcloud (if not already installed)
# macOS: brew install google-cloud-sdk
# Windows: Download from https://cloud.google.com/sdk/docs/install
# Linux: Follow https://cloud.google.com/sdk/docs/install

# Verify installation
gcloud --version

# Authenticate with your Google account
gcloud auth login

# List your projects
gcloud projects list
```

### Step 2: Set Up Redis (Upstash)

**Option A: Upstash (Recommended for Serverless)**

1. Go to [upstash.com](https://upstash.com) and sign up
2. Create a new Redis database
3. Select region closest to your GCP region (e.g., us-central1)
4. Copy the connection string (format: `redis://default:password@host:port`)
5. Create TWO databases:
   - `ct-b2c-staging` — For staging environment
   - `ct-b2c-production` — For production environment

**Option B: GCP Memorystore (Managed Redis)**

```bash
gcloud redis instances create ct-b2c-redis-prod \
    --size=1 \
    --region=us-central1 \
    --redis-version=redis_7_0
```

### Step 3: Run GCP Setup Script

This script will:
- Enable required GCP APIs
- Create Artifact Registry for Docker images
- Store secrets in Secret Manager
- Configure IAM permissions

```bash
# Set your GCP project ID
export GCP_PROJECT_ID=your-project-id

# Run setup script
./scripts/setup-gcp.sh
```

**You'll be prompted for:**
- commercetools credentials (project key, client ID, secret, URLs)
- Redis URLs (staging and production)

### Step 4: Set Up GitHub Secrets (For CI/CD)

If you want to use GitHub Actions for automated deployment:

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Add the following repository secrets:

| Secret Name | Value | Description |
|---|---|---|
| `GCP_PROJECT_ID` | your-project-id | Your GCP project ID |
| `GCP_SA_KEY` | `{...json...}` | Service account JSON key (see below) |
| `PROD_API_URL` | (set after first deploy) | Production API Cloud Run URL |
| `PROD_WEB_URL` | (set after first deploy) | Production Web Cloud Run URL |

**To create a service account for GitHub Actions:**

```bash
# Create service account
gcloud iam service-accounts create github-actions \
    --display-name="GitHub Actions Deployer"

# Grant necessary roles
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
    --member="serviceAccount:github-actions@$GCP_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
    --member="serviceAccount:github-actions@$GCP_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
    --member="serviceAccount:github-actions@$GCP_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/artifactregistry.admin"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
    --member="serviceAccount:github-actions@$GCP_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"

# Create and download key
gcloud iam service-accounts keys create github-actions-key.json \
    --iam-account=github-actions@$GCP_PROJECT_ID.iam.gserviceaccount.com

# Copy contents of github-actions-key.json to GitHub secret GCP_SA_KEY
cat github-actions-key.json  # Copy this output

# Delete local key file for security
rm github-actions-key.json
```

### Step 5: Deploy to Staging

**Option A: Manual Deployment (Recommended for First Time)**

```bash
# Set environment variable
export GCP_PROJECT_ID=your-project-id

# Deploy to staging
./scripts/deploy-to-gcp.sh staging
```

The script will:
1. Build Docker images for API and Web
2. Push images to Artifact Registry
3. Deploy to Cloud Run (staging environment)
4. Run health checks
5. Display URLs for deployed services

**Option B: GitHub Actions (Automated)**

```bash
# Commit and push to main branch
git checkout main
git merge develop
git push origin main

# GitHub Actions will automatically:
# 1. Run tests
# 2. Build & push images
# 3. Deploy to staging
# 4. Deploy to production (after manual approval)
```

### Step 6: Verify Staging Deployment

After deployment completes, you'll see output like:

```
API URL:     https://api-staging-xxxxx.run.app
Web URL:     https://web-staging-xxxxx.run.app
```

**Test the deployment:**

```bash
# Test API health
curl https://api-staging-xxxxx.run.app/health

# Test Web (open in browser)
open https://web-staging-xxxxx.run.app
```

### Step 7: Update GitHub Secrets (After First Deploy)

After your first staging deployment, update these GitHub secrets:

```bash
# Get staging URLs
export STAGING_API_URL=$(gcloud run services describe api-staging \
    --region=us-central1 --format='value(status.url)')

export STAGING_WEB_URL=$(gcloud run services describe web-staging \
    --region=us-central1 --format='value(status.url)')

echo "STAGING_API_URL: $STAGING_API_URL"
echo "STAGING_WEB_URL: $STAGING_WEB_URL"
```

Add these to GitHub secrets if using GitHub Actions.

### Step 8: Deploy to Production

Once staging is verified:

**Option A: Manual Deployment**

```bash
./scripts/deploy-to-gcp.sh production
```

**Option B: GitHub Actions**

Push to `main` branch — GitHub Actions will deploy to staging, then prompt for manual approval before deploying to production.

### Step 9: Configure Custom Domain (Optional)

```bash
# Map custom domain to Cloud Run service
gcloud run domain-mappings create \
    --service=web \
    --domain=yourdomain.com \
    --region=us-central1

# Get DNS records to configure
gcloud run domain-mappings describe \
    --domain=yourdomain.com \
    --region=us-central1
```

### Step 10: Set Up Cloud CDN (Optional, for Better Performance)

Follow the detailed Cloud CDN setup in [DEPLOYMENT_GUIDE.md](../docs/DEPLOYMENT_GUIDE.md#step-6-set-up-cloud-cdn).

## 🔍 Monitoring & Troubleshooting

### View Logs

```bash
# API logs (streaming)
gcloud run services logs read api \
    --region=us-central1 \
    --limit=50 \
    --follow

# Web logs
gcloud run services logs read web \
    --region=us-central1 \
    --limit=50 \
    --follow

# Staging logs
gcloud run services logs read api-staging \
    --region=us-central1 \
    --limit=50
```

### Check Service Status

```bash
# List all Cloud Run services
gcloud run services list --region=us-central1

# Describe specific service
gcloud run services describe api --region=us-central1

# Get service URL
gcloud run services describe api \
    --region=us-central1 \
    --format='value(status.url)'
```

### Common Issues

**1. "Permission denied" when accessing secrets**

```bash
# Grant Secret Manager access to Cloud Run
PROJECT_NUMBER=$(gcloud projects describe $GCP_PROJECT_ID --format='value(projectNumber)')
COMPUTE_SA="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
    --member="serviceAccount:$COMPUTE_SA" \
    --role="roles/secretmanager.secretAccessor"
```

**2. "Container failed to start"**

Check logs for errors:
```bash
gcloud run services logs read api --region=us-central1 --limit=100
```

Common causes:
- Missing environment variables
- Incorrect secret references
- Port mismatch (ensure PORT=8080 for API, PORT=3000 for Web)

**3. "502 Bad Gateway"**

- Check if the service is starting successfully: `gcloud run services describe api`
- Verify health endpoint: `curl https://api-xxxxx.run.app/health`
- Check logs for startup errors

**4. Web can't reach API**

Ensure:
- API service allows unauthenticated requests: `--allow-unauthenticated`
- Web service has correct `NEXT_PUBLIC_API_URL` and `INTERNAL_API_URL`
- API ingress allows traffic: `--ingress=internal-and-cloud-load-balancing`

## 📊 Cost Optimization

**Cloud Run Pricing (Approximate)**

- **Staging**: ~$5-10/month (min-instances=0, scales to zero)
- **Production**: ~$20-50/month (min-instances=1, always-on)

**Tips to Reduce Costs:**

1. Use `min-instances=0` for staging (scales to zero when not in use)
2. Use Upstash Redis (pay-per-request) instead of Memorystore
3. Set appropriate `max-instances` to prevent runaway scaling
4. Use Cloud CDN to cache static assets and reduce API calls

## 🎯 Quick Reference

### Deployment Commands

```bash
# First-time setup
./scripts/setup-gcp.sh

# Deploy to staging
./scripts/deploy-to-gcp.sh staging

# Deploy to production
./scripts/deploy-to-gcp.sh production

# View logs
gcloud run services logs read api --region=us-central1 --limit=50

# Update a secret
echo -n "new-value" | gcloud secrets versions add SECRET_NAME --data-file=-

# Rollback to previous revision
gcloud run services update-traffic api \
    --to-revisions=api-00002-abc=100 \
    --region=us-central1
```

### Environment Variables

| Variable | Set In | Purpose |
|---|---|---|
| `GCP_PROJECT_ID` | Local/GitHub | Your GCP project ID |
| `GCP_REGION` | Scripts | Deployment region (default: us-central1) |
| `CTP_*` | Secret Manager | commercetools credentials |
| `REDIS_URL` | Secret Manager | Redis connection string |
| `NEXT_PUBLIC_API_URL` | Build args | API URL for browser requests |
| `INTERNAL_API_URL` | Cloud Run | API URL for server-side requests |

## ✅ Deployment Checklist

- [ ] gcloud CLI installed and authenticated
- [ ] GCP project created with billing enabled
- [ ] Redis databases created (Upstash or Memorystore)
- [ ] Ran `./scripts/setup-gcp.sh` successfully
- [ ] GitHub secrets configured (if using CI/CD)
- [ ] Deployed to staging: `./scripts/deploy-to-gcp.sh staging`
- [ ] Verified staging deployment (API health + Web homepage)
- [ ] Deployed to production: `./scripts/deploy-to-gcp.sh production`
- [ ] Verified production deployment
- [ ] (Optional) Custom domain configured
- [ ] (Optional) Cloud CDN enabled
- [ ] Monitoring and alerts set up

## 📚 Additional Resources

- [GCP Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Artifact Registry Documentation](https://cloud.google.com/artifact-registry/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [Upstash Redis Documentation](https://docs.upstash.com/redis)
- [commercetools Documentation](https://docs.commercetools.com/)

---

**Need help?** Check the [DEPLOYMENT_GUIDE.md](../docs/DEPLOYMENT_GUIDE.md) for detailed troubleshooting and advanced configuration.
