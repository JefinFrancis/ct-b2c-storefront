#!/bin/bash
# GCP Deployment Script for CT B2C Storefront
# Usage: ./scripts/deploy-to-gcp.sh [staging|production]

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
GCP_REGION=${GCP_REGION:-us-central1}
ARTIFACT_REGISTRY_REPO=${ARTIFACT_REGISTRY_REPO:-ct-b2c-storefront}

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo -e "${RED}Error: Environment must be 'staging' or 'production'${NC}"
    echo "Usage: $0 [staging|production]"
    exit 1
fi

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  GCP Deployment Script${NC}"
echo -e "${BLUE}  Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if GCP_PROJECT_ID is set
if [[ -z "$GCP_PROJECT_ID" ]]; then
    echo -e "${RED}Error: GCP_PROJECT_ID environment variable is not set${NC}"
    echo "Set it with: export GCP_PROJECT_ID=your-project-id"
    exit 1
fi

echo -e "${GREEN}✓${NC} gcloud CLI found"
echo -e "${GREEN}✓${NC} GCP Project: $GCP_PROJECT_ID"
echo ""

# Get current Git commit SHA
GIT_SHA=$(git rev-parse --short HEAD)
echo -e "${BLUE}Building from commit: ${YELLOW}$GIT_SHA${NC}"
echo ""

# Set service names based on environment
if [[ "$ENVIRONMENT" == "production" ]]; then
    API_SERVICE="api"
    WEB_SERVICE="web"
    API_MEMORY="2Gi"
    API_CPU="2"
    API_MIN_INSTANCES="1"
    API_MAX_INSTANCES="20"
    WEB_MEMORY="1Gi"
    WEB_CPU="1"
    WEB_MIN_INSTANCES="1"
    WEB_MAX_INSTANCES="20"
    REDIS_SECRET="REDIS_URL_PROD"
else
    API_SERVICE="api-staging"
    WEB_SERVICE="web-staging"
    API_MEMORY="1Gi"
    API_CPU="1"
    API_MIN_INSTANCES="0"
    API_MAX_INSTANCES="10"
    WEB_MEMORY="512Mi"
    WEB_CPU="1"
    WEB_MIN_INSTANCES="0"
    WEB_MAX_INSTANCES="10"
    REDIS_SECRET="REDIS_URL_STAGING"
fi

# Image tags
API_IMAGE="$GCP_REGION-docker.pkg.dev/$GCP_PROJECT_ID/$ARTIFACT_REGISTRY_REPO/api:$GIT_SHA"
WEB_IMAGE="$GCP_REGION-docker.pkg.dev/$GCP_PROJECT_ID/$ARTIFACT_REGISTRY_REPO/web:$GIT_SHA"

echo -e "${BLUE}Step 1/5: Building API Docker image...${NC}"
echo "API Image: $API_IMAGE"

# Build API image
docker build \
    -f apps/api/Dockerfile \
    -t "$API_IMAGE" \
    . || {
    echo -e "${RED}Failed to build API image${NC}"
    exit 1
}
echo -e "${GREEN}✓${NC} API image built"

echo ""
echo -e "${BLUE}Step 2/5: Pushing API image to Artifact Registry...${NC}"

# Configure Docker authentication
gcloud auth configure-docker "$GCP_REGION-docker.pkg.dev" --quiet

# Push API image
docker push "$API_IMAGE" || {
    echo -e "${RED}Failed to push API image${NC}"
    exit 1
}
echo -e "${GREEN}✓${NC} API image pushed"

echo ""
echo -e "${BLUE}Step 3/5: Deploying API service to Cloud Run...${NC}"

gcloud run deploy "$API_SERVICE" \
    --image="$API_IMAGE" \
    --platform=managed \
    --region="$GCP_REGION" \
    --memory="$API_MEMORY" \
    --cpu="$API_CPU" \
    --timeout=300 \
    --min-instances="$API_MIN_INSTANCES" \
    --max-instances="$API_MAX_INSTANCES" \
    --ingress=internal-and-cloud-load-balancing \
    --set-env-vars=NODE_ENV=production \
    --set-secrets=CTP_PROJECT_KEY=CT_PROJECT_KEY:latest \
    --set-secrets=CTP_CLIENT_ID=CT_CLIENT_ID:latest \
    --set-secrets=CTP_CLIENT_SECRET=CT_CLIENT_SECRET:latest \
    --set-secrets=CTP_AUTH_URL=CT_AUTH_URL:latest \
    --set-secrets=CTP_API_URL=CT_API_URL:latest \
    --set-secrets=CTP_SCOPES=CT_SCOPES:latest \
    --set-secrets=REDIS_URL="$REDIS_SECRET":latest \
    --allow-unauthenticated || {
    echo -e "${RED}Failed to deploy API service${NC}"
    exit 1
}

# Get API URL
API_URL=$(gcloud run services describe "$API_SERVICE" \
    --region="$GCP_REGION" \
    --format='value(status.url)')
echo -e "${GREEN}✓${NC} API deployed: $API_URL"

echo ""
echo -e "${BLUE}Step 4/5: Building and pushing Web image...${NC}"

echo "Web Image: $WEB_IMAGE"

# Get Web build args (API URL is now known)
if [[ "$ENVIRONMENT" == "production" ]]; then
    NEXT_PUBLIC_APP_URL=${PROD_WEB_URL:-"https://web-placeholder.run.app"}
else
    NEXT_PUBLIC_APP_URL=${STAGING_WEB_URL:-"https://web-staging-placeholder.run.app"}
fi

# Build Web image with real API URL
docker build \
    -f apps/web/Dockerfile \
    -t "$WEB_IMAGE" \
    --build-arg NEXT_PUBLIC_API_URL="$API_URL" \
    --build-arg NEXT_PUBLIC_APP_URL="$NEXT_PUBLIC_APP_URL" \
    . || {
    echo -e "${RED}Failed to build Web image${NC}"
    exit 1
}
echo -e "${GREEN}✓${NC} Web image built"

# Push Web image
docker push "$WEB_IMAGE" || {
    echo -e "${RED}Failed to push Web image${NC}"
    exit 1
}
echo -e "${GREEN}✓${NC} Web image pushed"

echo ""
echo -e "${BLUE}Step 5/5: Deploying Web service to Cloud Run...${NC}"

gcloud run deploy "$WEB_SERVICE" \
    --image="$WEB_IMAGE" \
    --platform=managed \
    --region="$GCP_REGION" \
    --memory="$WEB_MEMORY" \
    --cpu="$WEB_CPU" \
    --timeout=300 \
    --min-instances="$WEB_MIN_INSTANCES" \
    --max-instances="$WEB_MAX_INSTANCES" \
    --ingress=all \
    --set-env-vars=NODE_ENV=production,NEXT_PUBLIC_API_URL="$API_URL",INTERNAL_API_URL="$API_URL" \
    --allow-unauthenticated || {
    echo -e "${RED}Failed to deploy Web service${NC}"
    exit 1
}

# Get Web URL
WEB_URL=$(gcloud run services describe "$WEB_SERVICE" \
    --region="$GCP_REGION" \
    --format='value(status.url)')
echo -e "${GREEN}✓${NC} Web deployed: $WEB_URL"

echo ""
echo -e "${BLUE}Verifying deployment...${NC}"

# Health check API
API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health" || echo "000")
if [[ "$API_HEALTH" == "200" ]]; then
    echo -e "${GREEN}✓${NC} API health check passed"
else
    echo -e "${YELLOW}⚠${NC} API health check returned: $API_HEALTH"
fi

# Check web homepage
WEB_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$WEB_URL" || echo "000")
if [[ "$WEB_CHECK" == "200" ]]; then
    echo -e "${GREEN}✓${NC} Web service responding"
else
    echo -e "${YELLOW}⚠${NC} Web service returned: $WEB_CHECK"
fi

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo -e "API URL:     ${BLUE}$API_URL${NC}"
echo -e "Web URL:     ${BLUE}$WEB_URL${NC}"
echo ""
echo -e "View logs with:"
echo -e "  ${YELLOW}gcloud run services logs read $API_SERVICE --region=$GCP_REGION${NC}"
echo -e "  ${YELLOW}gcloud run services logs read $WEB_SERVICE --region=$GCP_REGION${NC}"
echo ""
